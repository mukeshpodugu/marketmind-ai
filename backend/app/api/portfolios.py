from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Portfolio, Holding, Stock, ActivityLog
from app.db.schemas import PortfolioCreate, PortfolioResponse, HoldingCreate, PortfolioSummary
from app.services.portfolio_service import calculate_portfolio_performance
from app.api.auth import get_current_user, check_role
from typing import List
import datetime

router = APIRouter(prefix="/portfolios", tags=["Portfolio Management"])

@router.post("/", response_model=PortfolioResponse)
def create_portfolio(
    req: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Restrict guests from portfolio changes
    if current_user.role == "guest":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest users cannot create portfolios. Please register."
        )

    # Check if user already has a portfolio with this name
    existing = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.name == req.name
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Portfolio with this name already exists"
        )

    new_portfolio = Portfolio(user_id=current_user.id, name=req.name)
    db.add(new_portfolio)
    db.commit()
    db.refresh(new_portfolio)

    # Log action
    db.add(ActivityLog(user_id=current_user.id, action="CreatePortfolio", details=f"Created portfolio: {req.name}"))
    db.commit()

    return new_portfolio

@router.get("/", response_model=List[PortfolioResponse])
def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()

@router.post("/{portfolio_id}/holdings")
def add_holding(
    portfolio_id: int,
    req: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify portfolio ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio not found"
        )
        
    symbol_upper = req.symbol.upper()
    
    # Get or create stock record
    stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()
    if not stock:
        stock = Stock(symbol=symbol_upper, name=f"{symbol_upper} Inc.", sector="Financials")
        db.add(stock)
        db.commit()
        db.refresh(stock)
        
    new_holding = Holding(
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        shares=req.shares,
        buy_price=req.buy_price,
        purchase_date=req.purchase_date or datetime.datetime.utcnow()
    )
    db.add(new_holding)
    db.commit()
    
    # Log action
    db.add(ActivityLog(
        user_id=current_user.id,
        action="AddHolding",
        details=f"Added holding: {new_holding.shares} shares of {symbol_upper} at ${new_holding.buy_price}"
    ))
    db.commit()
    
    return {"message": "Holding added successfully", "holding_id": new_holding.id}

@router.delete("/{portfolio_id}/holdings/{holding_id}")
def remove_holding(
    portfolio_id: int,
    holding_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify portfolio ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
        
    holding = db.query(Holding).filter(
        Holding.id == holding_id,
        Holding.portfolio_id == portfolio_id
    ).first()
    if not holding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holding not found")
        
    symbol = holding.stock.symbol
    db.delete(holding)
    
    # Log action
    db.add(ActivityLog(
        user_id=current_user.id,
        action="RemoveHolding",
        details=f"Removed holding of {symbol} from portfolio {portfolio.name}"
    ))
    db.commit()
    
    return {"message": "Holding removed successfully"}

@router.get("/{portfolio_id}/summary", response_model=PortfolioSummary)
def get_portfolio_summary(
    portfolio_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify ownership
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Portfolio not found")
        
    summary = calculate_portfolio_performance(db, portfolio_id)
    return summary
