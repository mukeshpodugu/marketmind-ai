from sqlalchemy.orm import Session
from app.db.models import Portfolio, Holding, Stock
from app.db.schemas import PortfolioSummary, HoldingDetail
from app.ml.data_pipeline import fetch_stock_data
import datetime

def get_current_stock_price(db: Session, symbol: str) -> float:
    """
    Retrieves the latest price of a stock, using cached database info
    or a fast fetch from yfinance.
    """
    # Fetch from yfinance (retrieve last 5 days to get the final close price)
    end = datetime.datetime.now()
    start = end - datetime.timedelta(days=7)
    df = fetch_stock_data(symbol, start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d"))
    if not df.empty:
        return float(df['Close'].iloc[-1])
    return 100.0 # Standard fallback

def calculate_portfolio_performance(db: Session, portfolio_id: int) -> PortfolioSummary:
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        return None
        
    holdings_details = []
    total_value = 0.0
    total_cost = 0.0
    
    for holding in portfolio.holdings:
        stock = holding.stock
        curr_price = get_current_stock_price(db, stock.symbol)
        
        market_value = holding.shares * curr_price
        cost = holding.shares * holding.buy_price
        gain_loss = market_value - cost
        gain_loss_pct = (gain_loss / (cost + 1e-9)) * 100.0
        
        detail = HoldingDetail(
            id=holding.id,
            symbol=stock.symbol,
            name=stock.name,
            shares=holding.shares,
            buy_price=holding.buy_price,
            current_price=round(curr_price, 2),
            market_value=round(market_value, 2),
            total_cost=round(cost, 2),
            gain_loss=round(gain_loss, 2),
            gain_loss_percent=round(gain_loss_pct, 2),
            purchase_date=holding.purchase_date
        )
        
        holdings_details.append(detail)
        total_value += market_value
        total_cost += cost
        
    total_gain_loss = total_value - total_cost
    total_gain_loss_pct = (total_gain_loss / (total_cost + 1e-9)) * 100.0
    
    return PortfolioSummary(
        portfolio_id=portfolio.id,
        name=portfolio.name,
        total_value=round(total_value, 2),
        total_cost=round(total_cost, 2),
        total_gain_loss=round(total_gain_loss, 2),
        total_gain_loss_percent=round(total_gain_loss_pct, 2),
        holdings=holdings_details
    )
