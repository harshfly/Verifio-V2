"""
fusion.py — Combines ML classifier, perplexity, and burstiness signals.

Perplexity interpretation (entropy-based):
- LOW (~60-120): More predictable → leans AI
- MEDIUM (~120-150): Ambiguous zone
- HIGH (~150-200+): More varied → leans human
"""

WEIGHTS = {
    "ml": 0.55,
    "perplexity": 0.30,
    "burstiness": 0.15,
}

# Perplexity ranges (calibrated for entropy-based proxy)
PERPLEXITY_AI_THRESHOLD = 100.0     # Below this → likely AI
PERPLEXITY_HUMAN_THRESHOLD = 170.0  # Above this → likely human


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
