from fastapi import APIRouter, HTTPException
from schemas import AnalyzeRequest, AnalyzeResponse, SentenceResult
from pipeline.perplexity import compute_perplexity
from pipeline.burstiness import compute_burstiness
from pipeline.classifier import predict_score
from pipeline.fusion import fuse_signals
import nltk
import re

nltk.download("punkt", quiet=True)

router = APIRouter()

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


def _preprocess_and_tokenize(text: str) -> list[str]:
    """
    Cleans text and extracts meaningful sentences:
    - Merges isolated list numbers/bullets (e.g. '1.' or '7.') with their following text.
    - Prevents NLTK from splitting on periods in numbered lists (e.g. '1. Introduction').
    - Discards standalone punctuation/number fragments that are not sentences.
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    merged_lines = []

    i = 0
    while i < len(lines):
        line = lines[i]
        # Check if line is just a number/bullet e.g. "1." or "7." or "16 7."
        clean_num = re.sub(r'^\d+\s+', '', line)
        if re.match(r'^(\d+[\.\)]|[\*\-\#\•])\s*$', clean_num) and i + 1 < len(lines):
            merged_lines.append(clean_num.strip() + " " + lines[i + 1])
            i += 2
            continue
        merged_lines.append(line)
        i += 1

    full_text = "\n".join(merged_lines)
    # Protect periods in numbered lists: "1. Introduction" -> "1§DOT§ Introduction"
    protected_text = re.sub(r'(?<=\b\d)\.(?=\s+[A-Za-z0-9])', '§DOT§', full_text)

    raw_sentences = nltk.sent_tokenize(protected_text)
    clean_sentences = []

    for s in raw_sentences:
        s = s.replace('§DOT§', '.').strip()
        # Clean leading numbering if copied from line-numbered views
        s = re.sub(r'^\d+\s+(\d+[\.\)])', r'\1', s)
        # Skip lone numbers, bullets, or empty punctuation
        if re.match(r'^[\d\.\-\*\#\s\(\)\[\]:•]+$', s):
            continue
        if len(s.split()) < 2 and len(s) < 4:
            continue
        clean_sentences.append(s)

    # Fallback to standard tokenization if cleaning resulted in empty
    if not clean_sentences:
        clean_sentences = [s.strip() for s in nltk.sent_tokenize(text) if s.strip()]

    return clean_sentences


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Accepts a block of text, cleans and splits it into sentences,
    runs the 3-signal ML pipeline, and returns per-sentence scores.
    """
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    sentences = _preprocess_and_tokenize(text)
    if not sentences:
        raise HTTPException(status_code=400, detail="Could not extract sentences.")

    # Compute document-level burstiness across the entire text
    doc_burstiness = compute_burstiness(text)

    results = []
    scores = []
    weights = []

    for sentence in sentences:
        words = sentence.split()
        word_count = len(words)
        confidence = _get_confidence(word_count)

        if word_count < 3:
            # Ultra-short fragment (1-2 words): neutral score, minimal weight
            score = 0.5
            confidence = "low"
            weight = 0.1
        else:
            perplexity = compute_perplexity(sentence)
            burstiness = doc_burstiness if len(sentences) > 1 else compute_burstiness(sentence)
            ml_score = predict_score(sentence)
            score = fuse_signals(perplexity, burstiness, ml_score)

            # For 3-4 word sentences: soften extreme ends since very short sentences lack full features
            if word_count < 5:
                score = min(max(score, 0.20), 0.80)
                weight = 0.4
            elif confidence == "medium":
                weight = 0.8
            else:
                weight = 1.0

        scores.append(score)
        weights.append(weight)

        results.append(SentenceResult(
            sentence=sentence,
            score=round(score, 4),
            confidence=confidence
        ))

    # Robust weighted average for document overall score
    if weights and sum(weights) > 0:
        overall_score = round(sum(s * w for s, w in zip(scores, weights)) / sum(weights), 4)
    else:
        overall_score = round(sum(scores) / max(len(scores), 1), 4)

    return AnalyzeResponse(sentences=results, overall_score=overall_score)
