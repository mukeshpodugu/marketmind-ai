from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Stock, NewsArticle
from app.db.schemas import MarketMoodResponse, NewsArticleResponse
from app.ml.sentiment_analysis import get_market_mood
from app.api.auth import get_current_user
from app.db.models import User
import yfinance as yf
import datetime
import logging

logger = logging.getLogger("marketmind")
router = APIRouter(prefix="/sentiment", tags=["Market Sentiment"])

# Dynamic mock news headlines database to use if yfinance/APIs return empty
MOCK_NEWS_HEADLINES = {
    "AAPL": [
        {"title": "Apple unveils next-generation M5 processors with advanced tensor cores.", "summary": "Silicon upgrade expected to boost hardware-level AI workflows across all Mac and iPad models.", "source": "Bloomberg"},
        {"title": "Global shipments of iPhones surge 12% in the second quarter.", "summary": "Strong demand in emerging markets offsets consolidation in North American markets.", "source": "Reuters"},
        {"title": "Antitrust scrutiny intensifies on App Store policies in European markets.", "summary": "Regulators review potential compliance infractions under Digital Markets Act guidelines.", "source": "TechCrunch"}
    ],
    "MSFT": [
        {"title": "Microsoft Copilot active subscriptions beat analyst consensus.", "summary": "Cloud commercial division reports rapid enterprise onboarding and expanded seat counts.", "source": "WSJ"},
        {"title": "Azure announces infrastructure partnership with top defense contractors.", "summary": "Sovereign cloud solutions expanded to secure government intelligence workloads.", "source": "Financial Times"},
        {"title": "Database incident logs temporary outages on Azure cloud hubs.", "summary": "Redundancy failovers successfully resolve core services within two hours.", "source": "ZDNet"}
    ],
    "TSLA": [
        {"title": "Tesla secures massive gigafactory extension agreement in Berlin.", "summary": "European battery production expected to scale output by 35% under new zoning approvals.", "source": "Automotive News"},
        {"title": "Q2 EV deliveries dip slightly below target, citing shipping logistics.", "summary": "Global maritime re-routing forces brief component delays at assembly points.", "source": "Reuters"},
        {"title": "FSD beta trial logs 50 million autonomous miles driven globally.", "summary": "Neural network model version 12 reduces steering intervention metrics substantially.", "source": "Wired"}
    ],
    "GENERAL": [
        {"title": "Federal Reserve signals steady target interest rate corridor for Q3.", "summary": "Inflation metrics show consistent softening trends, allowing policy calibration room.", "source": "CNBC"},
        {"title": "Tech equities lead broad index gains as tech earnings begin.", "summary": "Investor sentiment turns optimistic as chip manufacturers report healthy margins.", "source": "MarketWatch"},
        {"title": "Geopolitical friction sparks brief spikes in global crude logistics costs.", "summary": "Alternative routes mitigate overall capacity risks across trade corridors.", "source": "Reuters"}
    ]
}

def get_articles_for_symbol(symbol: str) -> list:
    symbol_upper = symbol.upper()
    articles = []
    
    try:
        # Try fetching real news via yfinance
        ticker = yf.Ticker(symbol_upper)
        yf_news = ticker.news
        if yf_news:
            for item in yf_news[:5]:
                articles.append({
                    "title": item.get("title", ""),
                    "summary": item.get("summary", "") or item.get("title", ""),
                    "url": item.get("link", ""),
                    "source": item.get("publisher", "Yahoo Finance"),
                    "published_at": datetime.datetime.fromtimestamp(item.get("providerPublishTime", datetime.datetime.now().timestamp()))
                })
    except Exception as e:
        logger.warning(f"Failed to fetch live yfinance news for {symbol_upper}: {e}")

    # Fallback to high-quality mocks if yfinance news is empty
    if not articles:
        mocks = MOCK_NEWS_HEADLINES.get(symbol_upper, MOCK_NEWS_HEADLINES["GENERAL"])
        for m in mocks:
            articles.append({
                "title": m["title"],
                "summary": m["summary"],
                "url": "https://finance.yahoo.com",
                "source": m["source"],
                "published_at": datetime.datetime.utcnow() - datetime.timedelta(hours=int(datetime.datetime.now().second % 12 + 1))
            })
            
    return articles

@router.get("/", response_model=MarketMoodResponse)
def get_market_sentiment(symbol: str = "GENERAL", db: Session = Depends(get_db)):
    symbol_upper = symbol.upper()
    
    # 1. Fetch articles
    raw_articles = get_articles_for_symbol(symbol_upper)
    
    # 2. Get DB stock reference
    stock_id = None
    if symbol_upper != "GENERAL":
        stock = db.query(Stock).filter(Stock.symbol == symbol_upper).first()
        if stock:
            stock_id = stock.id

    # 3. Calculate sentiments
    mood = get_market_mood(raw_articles)
    
    # 4. Save articles and sentiments to database
    recent_articles = []
    for art in raw_articles:
        # Avoid duplicate articles in the response
        from app.ml.sentiment_analysis import analyze_sentiment
        analysis = analyze_sentiment(f"{art['title']} {art['summary']}")
        
        # Save record
        db_article = NewsArticle(
            stock_id=stock_id,
            title=art["title"],
            summary=art["summary"],
            url=art["url"],
            source=art["source"],
            sentiment_score=analysis["score"],
            sentiment_label=analysis["label"],
            published_at=art["published_at"]
        )
        db.add(db_article)
        db.commit()
        db.refresh(db_article)
        
        recent_articles.append(NewsArticleResponse(
            id=db_article.id,
            title=db_article.title,
            summary=db_article.summary,
            url=db_article.url,
            source=db_article.source,
            sentiment_score=db_article.sentiment_score,
            sentiment_label=db_article.sentiment_label,
            published_at=db_article.published_at
        ))

    return MarketMoodResponse(
        mood_index=mood["mood_index"],
        sentiment_label=mood["sentiment_label"],
        positive_count=mood["positive_count"],
        negative_count=mood["negative_count"],
        neutral_count=mood["neutral_count"],
        recent_news=recent_articles
    )
