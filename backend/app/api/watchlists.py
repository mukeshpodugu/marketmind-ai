from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Watchlist, Stock, ActivityLog
from app.db.schemas import WatchlistCreate, WatchlistResponse
from app.api.auth import get_current_user
from typing import List

router = APIRouter(prefix="/watchlists", tags=["Watchlist Management"])

@router.post("/", response_model=WatchlistResponse)
def add_to_watchlist(
    req: WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "guest":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Guest users cannot add to watchlist. Please register."
        )
        
    symbol_upper = req.symbol.upper()
    
    # Get or create stock record
    stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()
    if not stock:
        stock = Stock(symbol=symbol_upper, name=f"{symbol_upper} Inc.", sector="Technology")
        db.add(stock)
        db.commit()
        db.refresh(stock)
        
    # Check if already in watchlist
    existing = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.stock_id == stock.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock is already in watchlist"
        )
        
    new_item = Watchlist(user_id=current_user.id, stock_id=stock.id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    # Log action
    db.add(ActivityLog(user_id=current_user.id, action="AddWatchlist", details=f"Added {symbol_upper} to watchlist"))
    db.commit()
    
    return new_item

@router.get("/", response_model=List[WatchlistResponse])
def list_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Watchlist).filter(Watchlist.user_id == current_user.id).all()

@router.delete("/{watchlist_id}")
def remove_from_watchlist(
    watchlist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Watchlist).filter(
        Watchlist.id == watchlist_id,
        Watchlist.user_id == current_user.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Watchlist item not found")
        
    symbol = item.stock.symbol
    db.delete(item)
    
    # Log action
    db.add(ActivityLog(user_id=current_user.id, action="RemoveWatchlist", details=f"Removed {symbol} from watchlist"))
    db.commit()
    
    return {"message": "Removed stock from watchlist successfully"}
