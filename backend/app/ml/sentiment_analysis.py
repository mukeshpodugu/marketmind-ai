import logging
from typing import List, Dict, Any

logger = logging.getLogger("marketmind")

# Flag to check if transformers is loaded and working
transformers_available = False
sentiment_pipeline = None

try:
    from transformers import pipeline
    # We will try initializing the pipeline lazily to avoid heavy startup delay.
    transformers_available = True
except Exception as e:
    logger.warning(f"Hugging Face transformers not available or failed to import: {e}. Using financial lexicon fallback.")

class LexiconSentimentAnalyzer:
    """
    A robust rule-based financial sentiment analyzer that maps common investment terms
    to sentiment scores. It mimics a BERT classifier's output structure.
    """
    def __init__(self):
        # positive financial words and weights
        self.positive_lexicon = {
            "bullish": 0.8, "profit": 0.6, "growth": 0.5, "upgrade": 0.7, "outperform": 0.6,
            "surge": 0.8, "gain": 0.5, "higher": 0.4, "beat": 0.5, "record": 0.6,
            "dividend": 0.4, "acquisition": 0.5, "exceed": 0.6, "expansion": 0.5,
            "success": 0.5, "positive": 0.4, "rebound": 0.5, "strong": 0.4, "rally": 0.7
        }
        # negative financial words and weights
        self.negative_lexicon = {
            "bearish": 0.8, "loss": 0.7, "decline": 0.5, "downgrade": 0.8, "underperform": 0.7,
            "plunge": 0.9, "drop": 0.5, "lower": 0.4, "miss": 0.6, "deficit": 0.7,
            "debt": 0.4, "lawsuit": 0.7, "investigation": 0.6, "shrink": 0.5,
            "failure": 0.6, "negative": 0.5, "slide": 0.5, "weak": 0.4, "crash": 0.9,
            "warns": 0.5, "layoff": 0.6, "risk": 0.4, "inflation": 0.4
        }

    def analyze(self, text: str) -> Dict[str, Any]:
        if not text:
            return {"label": "neutral", "score": 0.0}
            
        words = text.lower().split()
        pos_score = 0.0
        neg_score = 0.0
        
        for word in words:
            # Strip punctuation
            clean_word = word.strip(".,!?;:()\"'")
            if clean_word in self.positive_lexicon:
                pos_score += self.positive_lexicon[clean_word]
            elif clean_word in self.negative_lexicon:
                neg_score += self.negative_lexicon[clean_word]
                
        diff = pos_score - neg_score
        total = pos_score + neg_score
        
        if total == 0:
            return {"label": "neutral", "score": 0.0}
            
        # Normalize score between -1.0 and 1.0
        normalized_score = diff / (total + 1e-9)
        # Cap it
        normalized_score = max(-1.0, min(1.0, normalized_score))
        
        if normalized_score > 0.15:
            label = "positive"
        elif normalized_score < -0.15:
            label = "negative"
        else:
            label = "neutral"
            
        return {
            "label": label,
            "score": float(round(normalized_score, 2))
        }

lexicon_analyzer = LexiconSentimentAnalyzer()

def initialize_transformers_pipeline():
    global sentiment_pipeline
    if not transformers_available:
        return
        
    try:
        logger.info("Initializing FinBERT sentiment analysis pipeline...")
        # Use a lightweight finetuned financial sentiment model
        sentiment_pipeline = pipeline(
            "sentiment-analysis", 
            model="ProsusAI/finbert",
            device=-1 # Use CPU
        )
        logger.info("FinBERT pipeline initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize FinBERT pipeline: {e}. Falling back to lexicon analyzer.")
        sentiment_pipeline = None

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyzes the sentiment of a financial text.
    Returns a dict with 'label' (positive/negative/neutral) and 'score' (-1.0 to 1.0).
    """
    global sentiment_pipeline
    
    if transformers_available and sentiment_pipeline is None:
        # Lazy initialization
        initialize_transformers_pipeline()
        
    if sentiment_pipeline is not None:
        try:
            # FinBERT labels: positive, negative, neutral
            # Scores are probabilities (0.0 to 1.0)
            res = sentiment_pipeline(text[:512])[0] # Truncate to max token length
            label = res['label'].lower()
            prob = res['score']
            
            # Map label and probability to standard -1.0 to 1.0 score
            if label == "positive":
                score = prob
            elif label == "negative":
                score = -prob
            else:
                score = 0.0
                
            return {"label": label, "score": float(round(score, 2))}
        except Exception as e:
            logger.error(f"Error during FinBERT execution: {e}. Falling back to lexicon.")
            
    # Lexicon fallback
    return lexicon_analyzer.analyze(text)

def get_market_mood(articles: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Processes a list of articles, analyzes their individual sentiments,
    and returns a summary Market Mood Index (0 to 100).
    """
    if not articles:
        return {
            "mood_index": 50.0,
            "sentiment_label": "Neutral",
            "positive_count": 0,
            "negative_count": 0,
            "neutral_count": 0
        }
        
    pos, neg, neu = 0, 0, 0
    scores = []
    
    for art in articles:
        text = f"{art.get('title', '')} {art.get('summary', '')}"
        res = analyze_sentiment(text)
        scores.append(res['score'])
        
        if res['label'] == 'positive':
            pos += 1
        elif res['label'] == 'negative':
            neg += 1
        else:
            neu += 1
            
    avg_score = sum(scores) / len(scores) if scores else 0.0
    # Map from [-1.0, 1.0] to [0.0, 100.0]
    mood_index = (avg_score + 1.0) * 50.0
    
    if mood_index < 40.0:
        label = "Fear"
    elif mood_index > 60.0:
        label = "Greed"
    else:
        label = "Neutral"
        
    return {
        "mood_index": float(round(mood_index, 1)),
        "sentiment_label": label,
        "positive_count": pos,
        "negative_count": neg,
        "neutral_count": neu
    }
