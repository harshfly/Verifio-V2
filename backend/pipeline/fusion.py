"""
fusion.py — Combines ML classifier, perplexity, and burstiness signals.
"""

WEIGHTS = {
    "ml": 0.70,
    "perplexity": 0.20,
    "burstiness": 0.10,
}

# Perplexity ranges
PERPLEXITY_AI_THRESHOLD = 90.0     # Below this → likely AI
PERPLEXITY_HUMAN_THRESHOLD = 160.0  # Above this → likely human


def normalize_perplexity(perplexity: float) -> float:
    """
    Convert perplexity to an AI probability score.
    Low perplexity = high AI score, High perplexity = low AI score.
    Returns value in [0, 1] where 1 = definitely AI.
    """
    if perplexity <= PERPLEXITY_AI_THRESHOLD:
        return 1.0
    if perplexity >= PERPLEXITY_HUMAN_THRESHOLD:
        return 0.0
    normalized = (perplexity - PERPLEXITY_AI_THRESHOLD) / (PERPLEXITY_HUMAN_THRESHOLD - PERPLEXITY_AI_THRESHOLD)
    return 1.0 - normalized


def fuse_signals(perplexity: float, burstiness: float, ml_score: float) -> float:
    perplexity_score = normalize_perplexity(perplexity)
    burstiness_score = 1.0 - burstiness  # low burstiness = more AI-like
    final_score = (
        WEIGHTS["ml"] * ml_score
        + WEIGHTS["perplexity"] * perplexity_score
        + WEIGHTS["burstiness"] * burstiness_score
    )
    return float(min(max(final_score, 0.0), 1.0))
