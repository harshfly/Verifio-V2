"""
retrain_sentence_level.py — Retrain the classifier on sentence-level data.
Uses a synthetic + curated approach: generates sentence-level training data
from known AI/human writing patterns, plus existing model.pkl knowledge.

This avoids downloading the full HuggingFace dataset (network-heavy).
Instead, we craft high-quality representative sentences and augment them.
"""
import numpy as np
import joblib
import os
import nltk
import sys
import random

# Add parent dir to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

nltk.download("punkt_tab", quiet=True)
MODEL_OUTPUT = os.path.join(os.path.dirname(__file__), "model.pkl")

# ── Feature Extraction (must match classifier.py exactly) ──
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

    unique_ratio = len(set(w.lower() for w in words)) / len(words)
    avg_word_len = np.mean([len(w) for w in words])
    burstiness = compute_burstiness(text)
    punct_ratio = sum(1 for c in text if c in ".,;:!?\"'()-") / max(len(text), 1)
    sentences = nltk.sent_tokenize(text)
    avg_sent_len = np.mean([len(s.split()) for s in sentences]) if sentences else 0

    fillers = ["honestly", "actually", "basically", "literally", "just", "really",
               "tbh", "kinda", "sorta", "yeah", "like", "you know", "i mean",
               "well", "right", "okay", "ok", "um", "uh", "so"]
    filler_ratio = sum(1 for w in words if w.lower() in fillers) / max(len(words), 1)

    formal = ["furthermore", "moreover", "consequently", "therefore", "subsequently",
              "additionally", "nonetheless", "whereby", "thereby", "hence",
              "notwithstanding", "hitherto", "aforementioned", "respectively",
              "pertaining", "encompassing", "facilitating", "utilizing"]
    formal_ratio = sum(1 for w in words if w.lower() in formal) / max(len(words), 1)

    contractions = ["i'm", "it's", "don't", "can't", "won't", "i've", "we're",
                    "they're", "i'd", "you're", "he's", "she's", "that's",
                    "what's", "there's", "here's", "let's", "who's",
                    "wouldn't", "couldn't", "shouldn't", "isn't", "aren't",
                    "wasn't", "weren't", "hasn't", "haven't", "hadn't",
                    "didn't", "doesn't", "i'll", "you'll", "we'll", "they'll"]
    contraction_ratio = sum(1 for w in words if w.lower() in contractions) / max(len(words), 1)

    word_lengths = [len(w) for w in words]
    word_len_std = float(np.std(word_lengths)) if len(word_lengths) > 1 else 0.0

    if sentences:
        starters = [s.strip().split()[0].lower() for s in sentences if s.strip()]
        starter_diversity = len(set(starters)) / max(len(starters), 1)
    else:
        starter_diversity = 1.0

    comma_density = text.count(",") / max(len(words), 1)

    personal_pronouns = ["i", "my", "me", "mine", "myself", "we", "our", "us",
                         "you", "your", "yours"]
    pronoun_ratio = sum(1 for w in words if w.lower() in personal_pronouns) / max(len(words), 1)

    return [unique_ratio, avg_word_len, burstiness, punct_ratio, avg_sent_len,
            filler_ratio, formal_ratio, contraction_ratio,
            word_len_std, starter_diversity, comma_density, pronoun_ratio]


# ── CURATED TRAINING DATA ──
# Large set of real-world representative sentences

HUMAN_SENTENCES = [
    # Casual / conversational
    "I can't believe it's already Friday, this week went by so fast.",
    "Hey, did you see that new movie? It's actually pretty good.",
    "I'm so tired, I barely slept last night because of the noise outside.",
    "My dog ate my homework again, I swear I'm not making this up.",
    "omg that was literally the best pizza I've ever had in my life.",
    "I dunno, I kinda feel like we should just skip the meeting today.",
    "She's always late, but honestly I don't really mind anymore.",
    "Wait, you're telling me he actually said that? That's crazy.",
    "I've been thinking about this all day and I still can't figure it out.",
    "We're gonna be late if you don't hurry up, come on!",
    "I just realized I forgot my wallet at home, can you lend me some cash?",
    "That's not what I meant, let me explain it differently.",
    "You know what, I think you're right about this one.",
    "I was just sitting there minding my own business when it happened.",
    "Honestly, I don't care what they think about me anymore.",
    "We ordered Chinese food last night and it was absolutely terrible.",
    "My phone died right in the middle of an important call, typical.",
    "I ran into Jake at the store and he told me about his new job.",
    "Can you believe they're charging twenty bucks for parking now?",
    "I've been meaning to call you but I keep forgetting, sorry about that.",
    "It's kinda weird how things worked out, but I'm happy with it.",
    "So basically what happened was she showed up late and missed everything.",
    "I'm not gonna lie, that test was way harder than I expected.",
    "He wouldn't stop talking about his vacation, it was so annoying.",
    "My mom called me three times today, she's worried about the weather.",
    "I love how you always know exactly what to say in these situations.",
    "That's hilarious, I can't stop laughing at that meme you sent.",
    "We should definitely go hiking this weekend if the weather's nice.",
    "I told her I wasn't interested but she just wouldn't take no for an answer.",
    "Dude, you won't believe what happened at work today.",
    # Personal stories / diary style
    "Today was one of those days where nothing went right from the start.",
    "I woke up to find my car had been broken into overnight.",
    "The sunset last night was absolutely breathtaking, I wish I'd taken a photo.",
    "I finally finished reading that book I started three months ago.",
    "My grandmother used to make the best apple pie every Thanksgiving.",
    "I remember when we used to play in the creek behind the old house.",
    "The interview went terribly, I stumbled over every single question.",
    "I spent the whole afternoon cleaning out the garage and found some old photos.",
    "My neighbor's cat keeps coming into our yard and scaring the birds away.",
    "I tried cooking a new recipe and set off the smoke alarm twice.",
    # Academic writing (HUMAN — often formal but still human)
    "The results of our study suggest a correlation between sleep deprivation and cognitive decline.",
    "While previous research has focused on urban populations, our sample includes rural communities.",
    "The data reveal a statistically significant difference between the control and treatment groups.",
    "Several limitations of this study should be acknowledged, including the small sample size.",
    "Future research should examine whether these findings generalize to other cultural contexts.",
    "The participants were recruited from three public universities in the southeastern United States.",
    "Our analysis builds on the framework proposed by Smith and colleagues in their 2019 paper.",
    "The survey instrument was pilot-tested with a group of 30 undergraduate students.",
    "These findings challenge the prevailing assumption that economic growth necessarily leads to improved outcomes.",
    "We collected data over a six-month period using both qualitative interviews and quantitative surveys.",
    # More academic human (expanded — formal but has specific details, methods, references)
    "The sample consisted of 342 adults aged 18 to 65 recruited from the greater Chicago area.",
    "We used a two-tailed t-test to compare mean scores between the experimental and control conditions.",
    "Institutional review board approval was obtained prior to data collection at each site.",
    "The response rate was 67 percent, which is consistent with other mail-based surveys in this field.",
    "Table 3 summarizes the demographic characteristics of the study participants by treatment group.",
    "As shown in Figure 2, the intervention group demonstrated a 23 percent improvement over baseline.",
    "The p-value for the primary outcome was 0.003, well below the pre-specified alpha of 0.05.",
    "Confounding variables were controlled for using a multivariate regression model.",
    "The interrater reliability coefficient was 0.91, indicating excellent agreement between coders.",
    "Our findings are consistent with those reported by Johnson et al. in their 2021 meta-analysis.",
    "The qualitative interviews lasted between 45 and 90 minutes and were audio-recorded with consent.",
    "Three participants dropped out of the study due to relocation, leaving a final sample of 339.",
    "The mean age of participants was 34.7 years with a standard deviation of 11.2 years.",
    "All statistical analyses were conducted using R version 4.2.1 with the tidyverse package.",
    "The Cronbach's alpha for the survey instrument was 0.87, indicating good internal consistency.",
    # More professional / business (HUMAN — specific details, real context)
    "The Johnson contract is worth 2.3 million dollars and runs through December 2025.",
    "We need to hire two additional developers before the March sprint starts.",
    "Revenue from the mobile app exceeded desktop revenue for the first time last quarter.",
    "The warehouse in Phoenix needs a new HVAC system before the summer heat kicks in.",
    "Our AWS bill jumped 40 percent this month because of that unoptimized Lambda function.",
    "The Chicago office is closing at the end of the fiscal year due to declining foot traffic.",
    "I spoke with the legal team and they flagged three clauses in the vendor agreement.",
    "The marketing campaign generated 12,000 leads but only 800 converted to paying customers.",
    "We lost the Acme account to a competitor who underbid us by fifteen percent.",
    "The quarterly earnings call is scheduled for Thursday at 4 PM Eastern time.",
    "We're behind schedule on the database migration by about two weeks.",
    "The CEO wants a status update on the AI integration project by end of day Friday.",
    "Our retention rate improved from 72 to 81 percent after we redesigned the onboarding flow.",
    "The new office in Austin will open in January and can accommodate up to 150 employees.",
    "Inventory levels in the Midwest distribution center are critically low for three SKUs.",
    # More news / journalism (HUMAN — specific details, places, people)
    "A 6.2-magnitude earthquake struck central Turkey early Monday, killing at least 14 people.",
    "The Federal Reserve raised interest rates by a quarter point for the third time this year.",
    "SpaceX successfully launched its Starship rocket from Boca Chica, Texas on Saturday morning.",
    "Amazon announced it will lay off approximately 10,000 employees in its devices division.",
    "The wildfire has burned over 30,000 acres and forced the evacuation of two small towns.",
    "A jury found the former CEO guilty on all 11 counts of fraud after a six-week trial.",
    "The city council voted 7-2 to approve the construction of a new light rail extension.",
    "Gas prices dropped to an average of 3.12 dollars per gallon nationwide this week.",
    "The university reported a record 89,000 applications for the incoming freshman class.",
    "Heavy flooding along the Mississippi River has displaced more than 5,000 families.",
    "The Supreme Court agreed to hear arguments in the case next October.",
    "Unemployment claims fell to their lowest level since March 2020, the Labor Department said.",
    "The new bridge connecting the two counties will cost an estimated 450 million dollars.",
    "A recall was issued for 200,000 vehicles due to a defective airbag sensor.",
    "The governor signed the bill into law after months of heated debate in the legislature.",
    # Wikipedia / encyclopedia (HUMAN — factual, referenced)
    "Construction of the bridge began in 1937 and was completed four years later.",
    "The city was founded in 1682 by William Penn as a place of religious tolerance.",
    "The human brain contains approximately 86 billion neurons.",
    "Mount Everest stands at 8,849 meters above sea level.",
    "The Roman Empire reached its greatest territorial extent under Emperor Trajan in 117 AD.",
    "The Amazon River is the largest river in the world by volume of water flow.",
    "Shakespeare wrote approximately 37 plays during his career as a playwright.",
    "The population of Tokyo is approximately 14 million in the city proper.",
    "The Great Wall of China stretches over 13,000 miles across northern China.",
    "Insulin was first isolated by Frederick Banting and Charles Best in 1921.",
    "The speed of light in a vacuum is approximately 299,792 kilometers per second.",
    "The Titanic sank on April 15, 1912 after striking an iceberg in the North Atlantic.",
    "Coffee is one of the most widely consumed beverages in the world.",
    "The Eiffel Tower was built for the 1889 World's Fair and stands 330 meters tall.",
    "The Nile River flows through 11 countries before emptying into the Mediterranean Sea.",
    # Professional / business (HUMAN)
    "We need to revisit our budget projections for Q4 given the current market conditions.",
    "The client called this morning and they're not happy with the latest design mockup.",
    "I'll set up a meeting with the stakeholders to discuss the timeline changes.",
    "Our team has been working overtime to meet the deadline, and it's starting to show.",
    "The sales numbers for last month were disappointing, especially in the northeast region.",
    "We should probably hold off on the launch until we've resolved the server issues.",
    "I talked to the vendor and they can't deliver until next Thursday at the earliest.",
    "The new employee seems promising but she'll need some time to get up to speed.",
    "Our competitors just released a similar product and it's getting a lot of attention.",
    "The board meeting was rescheduled to next week because two members are traveling.",
    # News / journalism (HUMAN)
    "A fire broke out at a downtown warehouse early Tuesday morning, injuring three firefighters.",
    "The mayor announced plans to increase funding for public schools by fifteen percent.",
    "Police are searching for a suspect who robbed a convenience store on Main Street.",
    "Thousands of people gathered in the park for the annual music festival despite the rain.",
    "The company laid off two hundred workers as part of a restructuring plan.",
    "Local residents are protesting the construction of a new highway through their neighborhood.",
    "The hospital reported a sharp increase in flu cases over the past two weeks.",
    "A new study found that air pollution levels in the city exceed safety standards.",
    "The football team won their fifth consecutive game, securing a spot in the playoffs.",
    "Scientists discovered a previously unknown species of frog in the Amazon rainforest.",
    # Short human sentences
    "We ordered pizza instead.",
    "Coffee helped.",
    "That was unexpected.",
    "She smiled and walked away.",
    "We'll figure it out tomorrow.",
    "I'm exhausted.",
    "Not sure about that.",
    "He didn't show up.",
    "Sounds good to me.",
    "Let's see what happens.",
    "I need a break.",
    "This isn't working.",
    "Whatever you say.",
    "The dog barked all night.",
    "I overslept again.",
    # Wikipedia-style factual (HUMAN)
    "The Bengal tiger is primarily found in India with smaller populations in Bangladesh and Nepal.",
    "Construction of the bridge began in 1937 and was completed four years later.",
    "The city was founded in 1682 by William Penn as a place of religious tolerance.",
    "Coffee is one of the most widely consumed beverages in the world.",
    "The human brain contains approximately 86 billion neurons.",
    "Mount Everest stands at 8,849 meters above sea level, making it the tallest mountain on Earth.",
    "The Roman Empire reached its greatest territorial extent under Emperor Trajan in 117 AD.",
    "Photosynthesis is the process by which plants convert sunlight into chemical energy.",
    "The Amazon River is the largest river in the world by volume of water flow.",
    "Shakespeare wrote approximately 37 plays during his career as a playwright.",
    # Stack Overflow / tech forum (HUMAN)
    "Have you tried clearing the cache? That usually fixes this kind of issue.",
    "I had the same problem and ended up switching to a different library.",
    "You need to use async/await here instead of callbacks, that's probably why it's hanging.",
    "The error message is misleading — the real issue is with your database connection string.",
    "I spent three hours debugging this and it turned out to be a missing semicolon.",
    "Check your package.json, you might have conflicting versions of React installed.",
    "This worked for me on Mac but I haven't tested it on Windows yet.",
    "The documentation is terrible for this API, I had to figure it out by trial and error.",
    "Just wrap it in a try-catch block and log the actual error to see what's going on.",
    "Make sure you're importing from the right module, they changed the exports in v3.",
    # Creative writing (HUMAN)
    "The rain hadn't stopped for three days and the river was rising fast.",
    "She pressed her forehead against the cold window and watched the world blur.",
    "He opened the letter with trembling hands, already knowing what it would say.",
    "The old house creaked and groaned in the wind like a ship at sea.",
    "She laughed — really laughed — for the first time in months.",
    "The sky turned orange and purple as the sun dipped below the horizon.",
    "His voice cracked when he tried to say goodbye.",
    "The garden was overgrown and wild, exactly the way she liked it.",
    "I could tell by the look on his face that something terrible had happened.",
    "The music stopped and for a moment everything was perfectly still.",
]

AI_SENTENCES = [
    # ChatGPT-style formal/structured
    "Artificial intelligence has revolutionized numerous sectors, from healthcare to finance, fundamentally transforming how we approach complex problems.",
    "Machine learning algorithms can now analyze vast datasets with unprecedented accuracy, enabling organizations to make data-driven decisions at scale.",
    "The integration of natural language processing has facilitated more intuitive human-computer interactions, paving the way for innovative applications.",
    "Climate change represents one of the most pressing challenges facing humanity, requiring immediate and coordinated global action.",
    "The burning of fossil fuels releases greenhouse gases into the atmosphere, creating a heat-trapping effect that leads to rising global temperatures.",
    "In today's rapidly evolving digital landscape, staying ahead of technological trends is more important than ever.",
    "Organizations that embrace digital transformation are better positioned to meet the changing needs of their customers.",
    "The development of renewable energy technologies offers promising solutions for reducing our dependence on fossil fuels.",
    "Education plays a pivotal role in shaping the future of society, equipping individuals with the knowledge and skills needed to succeed.",
    "The rapid advancement of technology has created both opportunities and challenges for businesses across various industries.",
    "Effective communication is essential for building strong relationships, both in personal and professional contexts.",
    "The global economy has undergone significant transformations in recent decades, driven by technological innovation and globalization.",
    "Sustainability has become a key consideration for businesses seeking to balance profitability with environmental responsibility.",
    "The healthcare industry continues to evolve, with new treatments and technologies improving patient outcomes and quality of life.",
    "Data analytics has emerged as a powerful tool for organizations looking to gain insights from their vast repositories of information.",
    "The concept of work-life balance has gained increasing attention as employees seek greater flexibility in their professional lives.",
    "Cybersecurity threats have become more sophisticated, requiring organizations to implement robust security measures to protect their digital assets.",
    "The rise of social media has transformed how people communicate, share information, and engage with brands and organizations.",
    "Infrastructure development is crucial for economic growth, providing the foundation for transportation, communication, and commerce.",
    "The principles of diversity and inclusion are fundamental to creating equitable and productive work environments.",
    # AI cover letters / professional
    "I am writing to express my strong interest in the Software Engineering position at your esteemed organization.",
    "With over five years of experience in full-stack development, I am confident that my skills align well with the requirements of this role.",
    "Throughout my career, I have consistently demonstrated my ability to collaborate effectively with cross-functional teams.",
    "I possess a proven track record of delivering high-quality solutions within tight deadlines and budget constraints.",
    "My experience in project management has equipped me with the skills necessary to lead diverse teams toward shared objectives.",
    "I am passionate about leveraging technology to solve complex business problems and drive organizational growth.",
    "My strong analytical skills, combined with my attention to detail, make me an ideal candidate for this position.",
    "I look forward to the opportunity to contribute to your organization's continued success and innovation.",
    "The skills and experiences I have gained throughout my career make me well-suited for this challenging and rewarding role.",
    "I am eager to bring my expertise in data analysis and strategic planning to your dynamic team.",
    # AI explanations / educational
    "Photosynthesis is the biological process by which plants convert light energy into chemical energy stored in glucose molecules.",
    "The water cycle describes the continuous movement of water through evaporation, condensation, precipitation, and collection.",
    "Gravity is a fundamental force of nature that attracts objects with mass toward each other, governing planetary motion.",
    "DNA serves as the molecular blueprint for life, encoding genetic instructions for the development and functioning of organisms.",
    "The electromagnetic spectrum encompasses all forms of electromagnetic radiation, from radio waves to gamma rays.",
    "Cellular respiration is the metabolic process by which cells convert nutrients into adenosine triphosphate for energy.",
    "The scientific method provides a systematic framework for investigating natural phenomena through observation and experimentation.",
    "Evolution by natural selection explains how organisms adapt to their environments over successive generations.",
    "Quantum mechanics describes the behavior of matter and energy at the atomic and subatomic levels.",
    "Thermodynamics is the branch of physics that deals with the relationships between heat, work, and energy.",
    # AI structured analysis
    "When examining the implications of this policy, several key considerations emerge that warrant careful attention.",
    "First, it is essential to consider the potential impact on stakeholders across various sectors of the economy.",
    "Second, the implementation timeline must be realistic and account for the complexities of regulatory compliance.",
    "Third, adequate resources must be allocated to ensure successful execution of the proposed initiatives.",
    "The analysis reveals that a multifaceted approach is necessary to address the underlying challenges effectively.",
    "These findings underscore the importance of evidence-based decision-making in developing effective strategies.",
    "The data suggest that targeted interventions can significantly improve outcomes when implemented consistently.",
    "It is worth noting that these results should be interpreted with caution due to the limitations of the available data.",
    "The framework presented here provides a comprehensive approach to understanding and addressing the identified issues.",
    "In conclusion, the evidence supports the adoption of a balanced strategy that addresses both short-term and long-term objectives.",
    # AI product reviews / blog
    "This product exceeded my expectations in every regard, delivering exceptional performance and reliability.",
    "The build quality is outstanding, featuring premium materials that feel substantial and well-crafted.",
    "The user interface is intuitive and well-designed, making it accessible to both beginners and experienced users alike.",
    "Overall, this represents an excellent value proposition for anyone seeking a reliable and versatile solution.",
    "The performance metrics demonstrate significant improvements over previous iterations of the technology.",
    "The comprehensive feature set addresses a wide range of use cases, making it suitable for diverse applications.",
    "Installation and setup are straightforward, with clear documentation guiding users through each step of the process.",
    "The customer support team is responsive and knowledgeable, providing timely assistance when needed.",
    "This solution effectively addresses the key pain points identified by users in previous product iterations.",
    "The seamless integration with existing workflows makes this an attractive option for organizations of all sizes.",
    # AI news writing
    "The city council unanimously approved the new infrastructure development plan during Tuesday's session.",
    "The comprehensive plan allocates funding for road improvements, public transportation expansion, and community facilities.",
    "Officials estimate that the project will create approximately 5,000 jobs over the next three years.",
    "The initiative represents a significant investment in the region's long-term economic development and sustainability.",
    "Stakeholders from various sectors have expressed support for the proposed measures and their anticipated benefits.",
    "The newly released report highlights significant progress in achieving the organization's strategic objectives.",
    "Implementation of the program is expected to begin in the first quarter of the upcoming fiscal year.",
    "The partnership between the two organizations aims to leverage complementary strengths for mutual benefit.",
    "The findings of the study have important implications for policy development and resource allocation decisions.",
    "The announcement follows months of careful planning and consultation with relevant stakeholders and community leaders.",
    # AI short sentences
    "Machine learning is a subset of artificial intelligence.",
    "This approach has numerous practical applications.",
    "The results demonstrate significant improvement.",
    "Further research is needed to validate these findings.",
    "The system operates with remarkable efficiency.",
    "This methodology provides a robust framework for analysis.",
    "The technology offers unprecedented capabilities.",
    "Implementation requires careful consideration of multiple factors.",
    "The data clearly support this conclusion.",
    "Effective solutions require comprehensive understanding of the problem.",
    # AI creative writing (still detectable by uniformity)
    "The ancient library stood as a testament to centuries of accumulated knowledge and wisdom.",
    "Its towering shelves reached toward vaulted ceilings, each laden with leather-bound volumes.",
    "The air was thick with the scent of aged paper and polished wood, creating an atmosphere of reverent stillness.",
    "Moonlight filtered through the stained glass windows, casting prismatic patterns across the marble floor.",
    "The protagonist gazed upon the sprawling landscape, contemplating the journey that lay ahead.",
    "Shadows danced across the walls as the flickering candlelight illuminated the forgotten chamber.",
    "The village emerged from the morning mist like a painting slowly coming to life.",
    "Her eyes reflected the wisdom of countless experiences, each one etched into her weathered face.",
    "The melody floated through the air, weaving itself into the fabric of the evening atmosphere.",
    "Time seemed to stand still as the two figures faced each other across the moonlit garden.",
]

# Generate additional variations through augmentation
def augment_data(sentences, label, target_count=500):
    """Augment sentences through word-level shuffling and noise."""
    augmented = [(s, label) for s in sentences]
    random.seed(42)

    while len(augmented) < target_count:
        base = random.choice(sentences)
        words = base.split()

        # Variant: slightly modify punctuation or capitalization
        variant = base
        r = random.random()
        if r < 0.3 and len(words) > 5:
            # Remove a word
            idx = random.randint(1, len(words) - 2)
            words_copy = words[:idx] + words[idx+1:]
            variant = " ".join(words_copy)
        elif r < 0.6 and len(words) > 3:
            # Swap two adjacent words
            idx = random.randint(0, len(words) - 2)
            words_copy = words.copy()
            words_copy[idx], words_copy[idx+1] = words_copy[idx+1], words_copy[idx]
            variant = " ".join(words_copy)
        else:
            # Use as-is (duplicate with original sentence)
            variant = base

        if len(variant.split()) >= 3:
            augmented.append((variant, label))

    return augmented


def train():
    print("📥 Preparing sentence-level training data...")

    human_data = augment_data(HUMAN_SENTENCES, 0, target_count=600)  # 0 = Human
    ai_data = augment_data(AI_SENTENCES, 1, target_count=600)       # 1 = AI

    data = human_data + ai_data
    random.shuffle(data)

    print(f"✅ Human sentences: {len(human_data)} | AI sentences: {len(ai_data)}")
    print(f"   Total training samples: {len(data)}")

    print("\n🔧 Extracting features...")
    X, y = [], []
    for text, label in data:
        X.append(extract_features(text))
        y.append(label)

    X, y = np.array(X), np.array(y)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    print("\n🤖 Training (sentence-level, balanced regularization)...")
    model = Pipeline([
        ('standardscaler', StandardScaler()),
        ('logisticregression', LogisticRegression(max_iter=2000, C=0.5, random_state=42))
    ])
    model.fit(X_train, y_train)

    # Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
    print(f"\n📊 5-Fold CV Accuracy: {cv_scores.mean()*100:.1f}% (±{cv_scores.std()*100:.1f}%)")

    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"   Test Accuracy: {accuracy * 100:.2f}%")
    print(classification_report(y_test, model.predict(X_test), target_names=["Human", "AI"]))

    # Print feature coefficients
    lr = model.named_steps['logisticregression']
    feature_names = ["unique_ratio", "avg_word_len", "burstiness", "punct_ratio",
                     "avg_sent_len", "filler_ratio", "formal_ratio", "contraction_ratio",
                     "word_len_std", "starter_diversity", "comma_density", "pronoun_ratio"]
    print("Feature coefficients (toward class 1 = AI):")
    for name, coef in sorted(zip(feature_names, lr.coef_[0]), key=lambda x: abs(x[1]), reverse=True):
        direction = "→ AI" if coef > 0 else "→ Human"
        print(f"  {name:22s}: {coef:+.4f}  ({direction})")
    print(f"  {'Intercept':22s}: {lr.intercept_[0]:+.4f}")

    # Backup old model
    if os.path.exists(MODEL_OUTPUT):
        backup = MODEL_OUTPUT.replace(".pkl", ".old.pkl")
        import shutil
        shutil.copy2(MODEL_OUTPUT, backup)
        print(f"\n📦 Old model backed up to: {backup}")

    joblib.dump(model, MODEL_OUTPUT)
    print(f"✅ New model saved: {MODEL_OUTPUT}")

    # Quick sanity tests
    print("\n── Quick Sanity Tests ──")
    test_sentences = [
        ("Human casual", "I can't believe it's already November, where did the year go?"),
        ("Human formal", "Our Q3 revenue fell short of projections by approximately 12 percent."),
        ("Human short", "We ordered pizza instead."),
        ("AI ChatGPT", "Artificial intelligence has revolutionized numerous sectors, fundamentally transforming how we approach complex problems."),
        ("AI cover letter", "I am writing to express my strong interest in the position at your esteemed organization."),
        ("AI short", "The system operates with remarkable efficiency and precision."),
        ("Human story", "The rain hadn't stopped for three days and Sarah was losing her mind."),
        ("Human academic", "The data reveal a statistically significant difference between the two groups."),
        ("Human Stack Overflow", "Have you tried clearing the cache? That usually fixes this kind of issue."),
        ("AI blog", "In today's rapidly evolving digital landscape, staying ahead of trends is essential."),
    ]
    for label, text in test_sentences:
        features = extract_features(text)
        prob = model.predict_proba([features[0] if isinstance(features, list) else features.flatten()])[0]
        ai_score = prob[1]  # class 1 = AI
        verdict = "AI" if ai_score > 0.65 else "Human" if ai_score < 0.35 else "Uncertain"
        status = "✓" if (("Human" in label and verdict == "Human") or
                         ("AI" in label and verdict == "AI")) else "✗"
        print(f"  {status} {label:20s} → {ai_score*100:.1f}% AI ({verdict})")


if __name__ == "__main__":
    train()
