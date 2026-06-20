from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Stock
from app.db.schemas import StockResponse
from app.ml.data_pipeline import fetch_stock_data
from typing import List, Optional
import datetime

router = APIRouter(prefix="/stocks", tags=["Stocks & Market Data"])

# Popular pre-seeded symbols
POPULAR_STOCKS = [
    {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Technology"},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Technology"},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Technology"},
    {"symbol": "AMZN", "name": "Amazon.com, Inc.", "sector": "Consumer Cyclical"},
    {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology"},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "sector": "Consumer Cyclical"},
    {"symbol": "META", "name": "Meta Platforms, Inc.", "sector": "Technology"},
    {"symbol": "AMD", "name": "Advanced Micro Devices, Inc.", "sector": "Technology"},
    {"symbol": "BTC-USD", "name": "Bitcoin USD", "sector": "Cryptocurrency"},
]

def seed_default_stocks(db: Session):
    """
    Seeds popular stocks on startup if the database table is empty.
    """
    if db.query(Stock).count() == 0:
        for item in POPULAR_STOCKS:
            db.add(Stock(symbol=item["symbol"], name=item["name"], sector=item["sector"]))
        db.commit()

@router.get("/", response_model=List[StockResponse])
def get_all_stocks(db: Session = Depends(get_db)):
    seed_default_stocks(db)
    return db.query(Stock).all()

@router.get("/search", response_model=List[StockResponse])
def search_stocks(q: str, db: Session = Depends(get_db)):
    seed_default_stocks(db)
    results = db.query(Stock).filter(
        (Stock.symbol.ilike(f"%{q}%")) | (Stock.name.ilike(f"%{q}%"))
    ).all()
    return results

@router.get("/detail/{symbol}")
def get_stock_detail(symbol: str, days: Optional[int] = 365, db: Session = Depends(get_db)):
    # Verify/Add stock record to database if it doesn't exist
    symbol_upper = symbol.upper()
    stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()
    if not stock:
        # Determine a reasonable default name
        name = f"{symbol_upper} Inc."
        sector = "Financials"
        for item in POPULAR_STOCKS:
            if item["symbol"] == symbol_upper:
                name = item["name"]
                sector = item["sector"]
                break
                
        stock = Stock(symbol=symbol_upper, name=name, sector=sector)
        db.add(stock)
        db.commit()
        db.refresh(stock)

    end_date = datetime.datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime("%Y-%m-%d")
    
    df = fetch_stock_data(symbol_upper, start_date, end_date)
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock data not found for symbol: {symbol_upper}"
        )
        
    # Convert dataframe into list of dicts for charting
    history = []
    for date, row in df.iterrows():
        history.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": float(row["Open"]),
            "high": float(row["High"]),
            "low": float(row["Low"]),
            "close": float(row["Close"]),
            "volume": int(row["Volume"])
        })
        
    return {
        "symbol": stock.symbol,
        "name": stock.name,
        "sector": stock.sector,
        "last_price": history[-1]["close"] if history else 0.0,
        "history": history
    }
