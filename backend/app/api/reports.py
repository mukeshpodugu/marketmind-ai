from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Stock, Report, ActivityLog
from app.db.schemas import ReportResponse
from app.api.auth import get_current_user
from app.services.reports_gen import generate_pdf_report, generate_excel_report
from app.ml.data_pipeline import fetch_stock_data, calculate_technical_indicators
from app.api.predictions import get_stock_predictions
from app.db.schemas import PredictionRequest
from app.api.sentiment import get_market_sentiment
from typing import List
import io
import os
import datetime

router = APIRouter(prefix="/reports", tags=["Report Generator"])

@router.get("/", response_model=List[ReportResponse])
def get_user_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "guest":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Guests cannot access reports.")
    return db.query(Report).filter(Report.user_id == current_user.id).all()

@router.get("/generate")
def generate_report(
    symbol: str = Query(..., description="Ticker symbol of the stock"),
    format: str = Query("pdf", description="File format: pdf or excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "guest":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guests cannot generate reports. Please register."
        )

    symbol_upper = symbol.upper()
    format_lower = format.lower()
    
    if format_lower not in ["pdf", "excel"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported format. Choose 'pdf' or 'excel'.")

    # 1. Fetch stock basic info
    stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()
    stock_name = stock.name if stock else f"{symbol_upper} Corp"
    stock_sector = stock.sector if stock else "Technology"
    
    # 2. Get predictions data (this will use cache if already computed)
    try:
        pred_req = PredictionRequest(symbol=symbol_upper)
        predictions = get_stock_predictions(pred_req, current_user, db)
    except Exception as e:
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail=f"Failed to compile forecasting values: {str(e)}"
         )

    # 3. Get sentiment data
    sentiment_data = get_market_sentiment(symbol_upper, db)
    
    # 4. Get last indicators values
    # Fetch data to calculate indicators
    end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.datetime.now() - datetime.timedelta(days=120)).strftime("%Y-%m-%d")
    df = fetch_stock_data(symbol_upper, start_date, end_date)
    df_ind = calculate_technical_indicators(df)
    
    latest_ind = {
        "RSI": float(df_ind['RSI'].iloc[-1]),
        "MACD": float(df_ind['MACD'].iloc[-1]),
        "MACD_Signal": float(df_ind['MACD_Signal'].iloc[-1]),
        "Volatility": float(df_ind['Volatility'].iloc[-1]),
        "SMA_50": float(df_ind['SMA_50'].iloc[-1])
    }

    stock_data = {
        "symbol": symbol_upper,
        "name": stock_name,
        "sector": stock_sector,
        "current_price": predictions.current_price
    }

    # Helper maps predictions Pydantic object back into dict for report services
    pred_dict = {
        "best_model": predictions.best_model,
        "confidence_score": predictions.confidence_score,
        "risk_score": predictions.risk_score,
        "risk_category": predictions.risk_category,
        "predictions": {
            k: [{"predicted_price": p.predicted_price, 
                 "confidence_lower": p.confidence_lower, 
                 "confidence_upper": p.confidence_upper,
                 "direction": p.direction} for p in v] 
            for k, v in predictions.predictions.items()
        }
    }

    sent_dict = {
        "mood_index": sentiment_data.mood_index,
        "sentiment_label": sentiment_data.sentiment_label
    }

    # Generate document bytes
    if format_lower == "pdf":
        file_stream = generate_pdf_report(stock_data, pred_dict, sent_dict, latest_ind)
        media_type = "application/pdf"
        filename = f"MarketMind_Report_{symbol_upper}_{datetime.date.today().isoformat()}.pdf"
    else:
        file_stream = generate_excel_report(stock_data, pred_dict, sent_dict, latest_ind)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"MarketMind_Report_{symbol_upper}_{datetime.date.today().isoformat()}.xlsx"

    # Save report reference in DB
    report_name = f"{symbol_upper} Analytics Report ({format_lower.upper()})"
    db_report = Report(
        user_id=current_user.id,
        name=report_name,
        file_path=filename,
        file_type=format_lower
    )
    db.add(db_report)
    
    # Log user action
    db.add(ActivityLog(
        user_id=current_user.id,
        action="GenerateReport",
        details=f"Generated report: {report_name} in {format_lower.upper()} format"
    ))
    db.commit()

    return StreamingResponse(
        file_stream,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
