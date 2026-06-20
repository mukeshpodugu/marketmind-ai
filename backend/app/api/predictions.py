from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Stock, Prediction, ActivityLog
from app.db.schemas import PredictionRequest, PredictionResponse, ModelMetrics, PredictionDetail
from app.ml.data_pipeline import fetch_stock_data, calculate_technical_indicators, generate_ml_features
from app.ml.models import run_ml_forecast_pipeline
from app.ml.xai import get_explainable_factors
from app.api.auth import get_current_user
from app.db.models import User
import datetime
import logging

logger = logging.getLogger("marketmind")
router = APIRouter(prefix="/predict", tags=["Predictions"])

# Simple in-memory cache for prediction results to avoid repeating ML training
prediction_cache = {}

@router.post("/", response_model=PredictionResponse)
def get_stock_predictions(
    req: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    symbol_upper = req.symbol.upper()
    
    # Check cache (expire cache daily by using the date in the key)
    cache_key = f"{symbol_upper}_{datetime.date.today().isoformat()}"
    if cache_key in prediction_cache:
        logger.info(f"Returning cached predictions for {symbol_upper}")
        return prediction_cache[cache_key]

    # Check if stock exists
    stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()
    if not stock:
        # Pre-seed stock record
        stock = Stock(symbol=symbol_upper, name=f"{symbol_upper} Inc.", sector="Technology")
        db.add(stock)
        db.commit()
        db.refresh(stock)

    # Fetch 3 years of data to have sufficient samples for deep learning (LSTM/GRU needs sequence lookbacks)
    end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.datetime.now() - datetime.timedelta(days=3 * 365)).strftime("%Y-%m-%d")
    
    df = fetch_stock_data(symbol_upper, start_date, end_date)
    if df.empty or len(df) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient historical data to train forecasting models for {symbol_upper}. Minimum 100 historical bars required."
        )

    # Apply technical indicators
    df_indicators = calculate_technical_indicators(df)
    
    # Generate windows
    lookback = 30
    X, y_day, y_week, y_month, y_quarter = generate_ml_features(df_indicators, lookback)
    
    if len(X) < 10:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dataset size is too small after windowing features. Cannot train forecasting models."
        )
         
    # Extract last lookback window for future prediction input
    last_window = df_indicators.tail(lookback).copy()
    feature_cols = [
        'Close', 'Open', 'High', 'Low', 'Volume', 
        'SMA_10', 'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 
        'RSI', 'MACD', 'MACD_Signal', 'BB_Upper', 'BB_Lower', 
        'Stoch_K', 'Stoch_D', 'Volatility'
    ]
    last_window_data = last_window[feature_cols].values
    
    # Current close price
    current_price = float(df_indicators['Close'].iloc[-1])
    
    # Run ML training & forecast comparison pipeline
    logger.info(f"Triggering ML training pipeline for user {current_user.username} on stock {symbol_upper}...")
    pipeline_res = run_ml_forecast_pipeline(
        X, y_day, y_week, y_month, y_quarter, None, last_window_data
    )

    # Calculate explainable AI factors
    latest_indicators = {
        "RSI": float(df_indicators['RSI'].iloc[-1]),
        "MACD": float(df_indicators['MACD'].iloc[-1]),
        "MACD_Signal": float(df_indicators['MACD_Signal'].iloc[-1]),
        "Volatility": float(df_indicators['Volatility'].iloc[-1]),
        "SMA_50": float(df_indicators['SMA_50'].iloc[-1])
    }
    explainable_factors = get_explainable_factors(symbol_upper, current_price, latest_indicators)

    # Reformat response metrics
    response_metrics = {}
    for mtype, mdict in pipeline_res["metrics"].items():
        response_metrics[mtype] = ModelMetrics(
            rmse=mdict["rmse"],
            mae=mdict["mae"],
            mape=mdict["mape"],
            r2=mdict["r2"]
        )

    # Structure predictions
    response_predictions = {}
    for horizon, plist in pipeline_res["predictions"].items():
        response_predictions[horizon] = [
            PredictionDetail(
                date=p["date"],
                predicted_price=round(p["predicted_price"], 2),
                confidence_lower=round(p["confidence_lower"], 2),
                confidence_upper=round(p["confidence_upper"], 2),
                direction=p["direction"]
            )
            for p in plist
        ]

    # Build response model
    result = PredictionResponse(
        symbol=symbol_upper,
        model_used=pipeline_res["best_model"],
        metrics=response_metrics,
        best_model=pipeline_res["best_model"],
        current_price=round(current_price, 2),
        predictions=response_predictions,
        risk_score=pipeline_res["risk_score"],
        risk_category=pipeline_res["risk_category"],
        confidence_score=pipeline_res["confidence_score"],
        explainable_factors=explainable_factors
    )

    # Record predictions to database for historical monitoring
    best_forecast_day = result.predictions["day"][0]
    db_prediction = Prediction(
        stock_id=stock.id,
        model_name=result.best_model,
        target_date=datetime.datetime.strptime(best_forecast_day.date, "%Y-%m-%d"),
        predicted_price=best_forecast_day.predicted_price,
        confidence_score=result.confidence_score,
        risk_score=result.risk_score,
        direction=best_forecast_day.direction.lower(),
        actual_price=None  # Fillable later by background update
    )
    db.add(db_prediction)

    # Log user action
    log = ActivityLog(
        user_id=current_user.id,
        action="StockPrediction",
        details=f"Ran prediction for stock: {symbol_upper} (Model: {result.best_model})"
    )
    db.add(log)
    db.commit()

    # Save to cache
    prediction_cache[cache_key] = result
    
    return result
