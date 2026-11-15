import joblib
import numpy as np
import os
import nltk

nltk.download("punkt_tab", quiet=True)

_model = None
_MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/model.pkl")


def _load_model():
    global _model
    if _model is None:
        if not os.path.exists(_MODEL_PATH):
            return None
        _model = joblib.load(_MODEL_PATH)
    return _model


def extract_features(text: str) -> np.ndarray:
    words = text.split()
    if not words:
        return np.array([[0.0] * 12])

    # Feature 1: Vocabulary richness (case-insensitive)
    unique_ratio = len(set(w.lower() for w in words)) / len(words)

    # Feature 2: Average word length
    avg_word_len = float(np.mean([len(w) for w in words]))

    # Feature 3: Burstiness (sentence length variance)
    sentences = nltk.sent_tokenize(text)
    word_counts = [len(s.split()) for s in sentences if s.strip()]
    if len(word_counts) < 2:
        wc = word_counts[0] if word_counts else 10
        burstiness = float(min(max((wc - 5) / 35, 0.0), 1.0))
    else:
        burstiness = float(min(np.std(word_counts) / 15.0, 1.0))

    # Feature 4: Punctuation ratio
    punct_ratio = sum(1 for c in text if c in ".,;:!?\"'()-") / max(len(text), 1)

    # Feature 5: Average sentence length
    avg_sent_len = float(np.mean([len(s.split()) for s in sentences])) if sentences else 0.0

    # Feature 6: Filler words ratio (expanded list)
    fillers = ["honestly", "actually", "basically", "literally", "just", "really",
               "tbh", "kinda", "sorta", "yeah", "like", "you know", "i mean",
               "well", "right", "okay", "ok", "um", "uh", "so"]
    filler_ratio = sum(1 for w in words if w.lower() in fillers) / max(len(words), 1)

    # Feature 7: Formal words ratio (expanded list)
    formal = ["furthermore", "moreover", "consequently", "therefore", "subsequently",
              "additionally", "nonetheless", "whereby", "thereby", "hence",
              "notwithstanding", "hitherto", "aforementioned", "respectively",
              "pertaining", "encompassing", "facilitating", "utilizing"]
    formal_ratio = sum(1 for w in words if w.lower() in formal) / max(len(words), 1)

    # Feature 8: Contraction usage (expanded list)
    contractions = ["i'm", "it's", "don't", "can't", "won't", "i've", "we're",
                    "they're", "i'd", "you're", "he's", "she's", "that's",
                    "what's", "there's", "here's", "let's", "who's",
                    "wouldn't", "couldn't", "shouldn't", "isn't", "aren't",
                    "wasn't", "weren't", "hasn't", "haven't", "hadn't",
                    "didn't", "doesn't", "i'll", "you'll", "we'll", "they'll"]
    contraction_ratio = sum(1 for w in words if w.lower() in contractions) / max(len(words), 1)

    # Feature 9: Word length standard deviation
    word_lengths = [len(w) for w in words]
    word_len_std = float(np.std(word_lengths)) if len(word_lengths) > 1 else 0.0

    # Feature 10: Sentence starter diversity
    if sentences:
        starters = [s.strip().split()[0].lower() for s in sentences if s.strip()]
        starter_diversity = len(set(starters)) / max(len(starters), 1)
    else:
        starter_diversity = 1.0

    # Feature 11: Comma density
    comma_density = text.count(",") / max(len(words), 1)

    # Feature 12: Personal pronoun ratio
    personal_pronouns = ["i", "my", "me", "mine", "myself", "we", "our", "us",
                         "you", "your", "yours"]
    pronoun_ratio = sum(1 for w in words if w.lower() in personal_pronouns) / max(len(words), 1)

    return np.array([[unique_ratio, avg_word_len, burstiness, punct_ratio,
                      avg_sent_len, filler_ratio, formal_ratio, contraction_ratio,
                      word_len_std, starter_diversity, comma_density, pronoun_ratio]])


def predict_score(text: str) -> float:
    model = _load_model()
    if model is None:
        return 0.5
    features = extract_features(text)
    prob = model.predict_proba(features)[0]
    # In this trained model, class 0 corresponds to Human and class 1 corresponds to AI
    return float(prob[1])


if __name__ == "__main__":
    samples = [
        "The mitochondria is the powerhouse of the cell and plays a critical role.",
        "I dunno, it was just kinda weird how that whole thing went down tbh.",
    ]
    for s in samples:
        print(f"Score: {predict_score(s):.4f} | {s[:60]}")
