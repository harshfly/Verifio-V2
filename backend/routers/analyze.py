from fastapi import APIRouter, HTTPException
from schemas import AnalyzeRequest, AnalyzeResponse, SentenceResult
from pipeline.perplexity import compute_perplexity
from pipeline.burstiness import compute_burstiness
from pipeline.classifier import predict_score
from pipeline.fusion import fuse_signals
import nltk

nltk.download("punkt", quiet=True)

router = APIRouter()

# Confidence thresholds based on word count
MIN_WORDS_HIGH_CONFIDENCE = 10
MIN_WORDS_MEDIUM_CONFIDENCE = 5


def _get_confidence(word_count: int) -> str:
    """Determine confidence level based on sentence word count."""
    if word_count >= MIN_WORDS_HIGH_CONFIDENCE:
        return "high"
    elif word_count >= MIN_WORDS_MEDIUM_CONFIDENCE:
        return "medium"
    else:
        return "low"


def _dampen_score(score: float, confidence: str) -> float:
    """Pull low-confidence scores toward 0.5 (uncertain)."""
    if confidence == "low":
        # Strong dampening: 70% toward 0.5
        return 0.5 + (score - 0.5) * 0.3
    elif confidence == "medium":
        # Mild dampening: 30% toward 0.5
        return 0.5 + (score - 0.5) * 0.7
    return score


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Accepts a block of text, splits it into sentences,
    runs the 3-signal ML pipeline, and returns per-sentence scores.
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    # Split into sentences
    sentences = nltk.sent_tokenize(text)
    if not sentences:
        raise HTTPException(status_code=400, detail="Could not extract sentences.")

    # Compute document-level burstiness across the entire text
    doc_burstiness = compute_burstiness(text)

    results = []
    scores = []
    weights = []  # weight each sentence by confidence for overall score

    for sentence in sentences:
        word_count = len(sentence.split())
        confidence = _get_confidence(word_count)

        if word_count < 3:
            # Too short to score reliably — treat as uncertain
            score = 0.5
            confidence = "low"
        else:
            perplexity = compute_perplexity(sentence)
            # Document-level length variance gives true context
            burstiness = doc_burstiness if len(sentences) > 1 else compute_burstiness(sentence)
            ml_score = predict_score(sentence)
            score = fuse_signals(perplexity, burstiness, ml_score)
            # Dampen score for short/unreliable sentences
            score = _dampen_score(score, confidence)

        scores.append(score)
        # Weight high-confidence sentences more in overall score
        weight = {"high": 1.0, "medium": 0.6, "low": 0.3}.get(confidence, 1.0)
        weights.append(weight)

        results.append(SentenceResult(
            sentence=sentence,
            score=round(score, 4),
            confidence=confidence
        ))

    # Weighted average for overall score
    if weights:
        overall_score = round(sum(s * w for s, w in zip(scores, weights)) / sum(weights), 4)
    else:
        overall_score = 0.0

    return AnalyzeResponse(sentences=results, overall_score=overall_score)
