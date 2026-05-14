def analyze_sentiment(text: str) -> float:
    """Returns sentiment score between -1 (negative) and 1 (positive)."""
    try:
        from textblob import TextBlob
        return TextBlob(text).sentiment.polarity
    except Exception:
        return 0.0


def sentiment_label(score: float) -> str:
    if score > 0.3:
        return "positive"
    elif score < -0.3:
        return "negative"
    return "neutral"
