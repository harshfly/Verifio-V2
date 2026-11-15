"""
train_classifier.py — Sentence-level AI text detection classifier
Trains on individual sentences (not paragraphs) for better sentence-level inference.
Includes improved features and better regularization to prevent contraction_ratio dominance.
"""
import numpy as np
import joblib
import os
import nltk
from datasets import load_dataset
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

nltk.download("punkt_tab", quiet=True)
MODEL_OUTPUT = os.path.join(os.path.dirname(__file__), "model.pkl")


def compute_burstiness(text):
    sentences = nltk.sent_tokenize(text)
    word_counts = [len(s.split()) for s in sentences if s.strip()]
    if len(word_counts) < 2:
        wc = word_counts[0] if word_counts else 10
        return float(min(max((wc - 5) / 35, 0.0), 1.0))
    return float(min(np.std(word_counts) / 15.0, 1.0))


def extract_features(text):
    words = text.split()
    if not words:
        return [0.0] * 12

    # ── Original features ──
    # Feature 1: Vocabulary richness
    unique_ratio = len(set(w.lower() for w in words)) / len(words)

    # Feature 2: Average word length
    avg_word_len = np.mean([len(w) for w in words])

    # Feature 3: Burstiness (sentence length variance)
    burstiness = compute_burstiness(text)

    # Feature 4: Punctuation ratio
    punct_ratio = sum(1 for c in text if c in ".,;:!?\"'()-") / max(len(text), 1)

    # Feature 5: Average sentence length
    sentences = nltk.sent_tokenize(text)
    avg_sent_len = np.mean([len(s.split()) for s in sentences]) if sentences else 0

    # Feature 6: Filler words ratio
    fillers = ["honestly", "actually", "basically", "literally", "just", "really",
               "tbh", "kinda", "sorta", "yeah", "like", "you know", "i mean",
               "well", "right", "okay", "ok", "um", "uh", "so"]
    filler_ratio = sum(1 for w in words if w.lower() in fillers) / max(len(words), 1)

    # Feature 7: Formal words ratio
    formal = ["furthermore", "moreover", "consequently", "therefore", "subsequently",
              "additionally", "nonetheless", "whereby", "thereby", "hence",
              "notwithstanding", "hitherto", "aforementioned", "respectively",
              "pertaining", "encompassing", "facilitating", "utilizing"]
    formal_ratio = sum(1 for w in words if w.lower() in formal) / max(len(words), 1)

    # Feature 8: Contraction usage
    contractions = ["i'm", "it's", "don't", "can't", "won't", "i've", "we're",
                    "they're", "i'd", "you're", "he's", "she's", "that's",
                    "what's", "there's", "here's", "let's", "who's",
                    "wouldn't", "couldn't", "shouldn't", "isn't", "aren't",
                    "wasn't", "weren't", "hasn't", "haven't", "hadn't",
                    "didn't", "doesn't", "i'll", "you'll", "we'll", "they'll"]
    contraction_ratio = sum(1 for w in words if w.lower() in contractions) / max(len(words), 1)

    # ── New features for better discrimination ──
    # Feature 9: Word length standard deviation (AI tends to be more uniform)
    word_lengths = [len(w) for w in words]
    word_len_std = float(np.std(word_lengths)) if len(word_lengths) > 1 else 0.0

    # Feature 10: Sentence starter diversity (AI often starts with similar patterns)
    if sentences:
        starters = [s.strip().split()[0].lower() for s in sentences if s.strip()]
        starter_diversity = len(set(starters)) / max(len(starters), 1)
    else:
        starter_diversity = 1.0

    # Feature 11: Comma density (AI tends to use more commas in structured lists)
    comma_density = text.count(",") / max(len(words), 1)

    # Feature 12: Personal pronoun ratio (humans use more I/my/me)
    personal_pronouns = ["i", "my", "me", "mine", "myself", "we", "our", "us",
                         "you", "your", "yours"]
    pronoun_ratio = sum(1 for w in words if w.lower() in personal_pronouns) / max(len(words), 1)

    return [unique_ratio, avg_word_len, burstiness, punct_ratio, avg_sent_len,
            filler_ratio, formal_ratio, contraction_ratio,
            word_len_std, starter_diversity, comma_density, pronoun_ratio]


def train():
    print("📥 Loading dataset...")
    dataset = load_dataset("artem9k/ai-text-detection-pile", split="train")
    total = len(dataset)

    human_sentences = []
    ai_sentences = []

    print("🔄 Extracting sentences from human text (first 100k items)...")
    count = 0
    for item in dataset.select(range(min(100000, total))):
        text = item.get("text", "")
        if not text or len(text.split()) < 20:
            continue
        # Split into sentences and use each sentence as a training sample
        sents = nltk.sent_tokenize(text.strip())
        for s in sents:
            word_count = len(s.split())
            if 5 <= word_count <= 60:  # filter reasonable sentence lengths
                human_sentences.append((s, 0))  # 0 = Human (class 0 = AI was old, now let's keep consistent)
        count += 1
        if count % 5000 == 0:
            print(f"   Processed {count} human docs, got {len(human_sentences)} sentences...")
        if len(human_sentences) >= 15000:
            break

    print(f"\n🔄 Extracting sentences from AI text (last 100k items)...")
    count = 0
    for item in dataset.select(range(max(0, total - 100000), total)):
        text = item.get("text", "")
        if not text or len(text.split()) < 20:
            continue
        sents = nltk.sent_tokenize(text.strip())
        for s in sents:
            word_count = len(s.split())
            if 5 <= word_count <= 60:
                ai_sentences.append((s, 1))  # 1 = AI
        count += 1
        if count % 5000 == 0:
            print(f"   Processed {count} AI docs, got {len(ai_sentences)} sentences...")
        if len(ai_sentences) >= 15000:
            break

    # Balance classes
    min_count = min(len(human_sentences), len(ai_sentences))
    np.random.seed(42)
    human_idx = np.random.choice(len(human_sentences), size=min(min_count, 12000), replace=False)
    ai_idx = np.random.choice(len(ai_sentences), size=min(min_count, 12000), replace=False)

    data = [human_sentences[i] for i in human_idx] + [ai_sentences[i] for i in ai_idx]
    np.random.shuffle(data)

    print(f"\n✅ Human sentences: {len(human_idx)} | AI sentences: {len(ai_idx)}")
    print(f"   Total training samples: {len(data)}")

    print("\n🔧 Extracting features...")
    X, y = [], []
    for i, (text, label) in enumerate(data):
        if i % 2000 == 0:
            print(f"   {i}/{len(data)}...")
        X.append(extract_features(text))
        y.append(label)

    X, y = np.array(X), np.array(y)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\n🤖 Training (with balanced regularization)...")
    # Use C=1.0 (more regularization) to prevent any single feature from dominating
    model = Pipeline([
        ('standardscaler', StandardScaler()),
        ('logisticregression', LogisticRegression(max_iter=2000, C=1.0, random_state=42))
    ])
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"\n📊 Accuracy: {accuracy * 100:.2f}%")
    print(classification_report(y_test, model.predict(X_test), target_names=["Human", "AI"]))

    # Print feature coefficients
    lr = model.named_steps['logisticregression']
    feature_names = ["unique_ratio", "avg_word_len", "burstiness", "punct_ratio",
                     "avg_sent_len", "filler_ratio", "formal_ratio", "contraction_ratio",
                     "word_len_std", "starter_diversity", "comma_density", "pronoun_ratio"]
    print("Feature coefficients (toward class 1 = AI):")
    for name, coef in sorted(zip(feature_names, lr.coef_[0]), key=lambda x: abs(x[1]), reverse=True):
        print(f"  {name:22s}: {coef:+.4f}")
    print(f"  Intercept: {lr.intercept_[0]:+.4f}")

    joblib.dump(model, MODEL_OUTPUT)
    print(f"\n✅ Model saved: {MODEL_OUTPUT}")


if __name__ == "__main__":
    train()
