# 🛡️ Verifio V2 — AI Text Detection & Forensic Content Verification

> **Sentence-level AI text detector & content authentication platform for educators, researchers, publishers, and developers.**  
> Built with high-precision statistical NLP, perplexity burstiness analysis, and an 8-feature machine learning classifier delivering **93.4% accuracy**.

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Accuracy](https://img.shields.io/badge/Accuracy-93.4%25-FF6B00?style=for-the-badge)](#-accuracy--benchmarks)
[![Maintainer](https://img.shields.io/badge/Creator-Harsh%20Malviya-111111?style=for-the-badge)](mailto:harshhmalviya09@gmail.com)

---

## 📌 Executive Overview

**Verifio V2** is an open-source, production-ready AI text forensic engine designed to identify machine-generated text (ChatGPT, GPT-4, Claude, Gemini, Llama, and paraphrasing tools). Unlike legacy black-box detectors that output an opaque overall percentage, Verifio delivers **sentence-by-sentence confidence heatmaps**, linguistic signal breakdowns, and downloadable forensic PDF audit reports.

### Primary Use Cases
- 🎓 **Academic Integrity**: Verify student essays, research dissertations, and homework submissions.
- 📰 **Editorial & Publishing**: Ensure journalistic authenticity before publishing articles and manuscripts.
- ⚖️ **Compliance & Auditing**: Forensic review of synthetic vs. human-authored documents.
- 🔍 **SEO & Content Quality**: Audit web content against synthetic text penalties.

---

## 🎯 Detection Verdict Scale

Each sentence and document is calibrated along a three-tier probabilistic scale:

| Tier | AI Probability | Indicator | Diagnostic Verdict |
|:---:|:---:|:---:|:---|
| 🟢 **Human** | `0.00 – 0.35` | Low AI Probability | Natural syntactic variation, human filler cadence, diverse burstiness |
| 🟠 **Uncertain** | `0.35 – 0.65` | Mixed Signals | Hybrid / co-authored, heavily edited, or paraphrased content |
| 🔴 **AI-Generated** | `0.65 – 1.00` | High AI Probability | Elevated vocabulary uniformity, formal connectives, monotonic sentence rhythm |

---

## 🔬 Multi-Signal Fusion Architecture

Verifio blends three independent linguistic metrics into a weighted Bayesian-inspired ensemble:

```
                      ┌──────────────────────────────────────┐
                      │          Input Text Document         │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
                 ▼                       ▼                       ▼
      ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
      │ Perplexity Analyzer │ │  Burstiness Scorer  │ │ 8-Feature ML Engine │
      │  (Predictability)   │ │ (Variance & Cadence)│ │ (Linguistic Vector) │
      └──────────┬──────────┘ └──────────┬──────────┘ └──────────┬──────────┘
                 │ (20% Weight)          │ (10% Weight)          │ (70% Weight)
                 └───────────────────────┼───────────────────────┘
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │ Multi-Signal Fusion    │
                            │      Score Engine      │
                            └────────────┬───────────┘
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │ Final Score [0.0 → 1.0]│
                            │  Sentence-by-Sentence  │
                            └────────────────────────┘
```

### The 8 Linguistic Features
1. **Vocabulary Uniqueness (Type-Token Ratio)**: Lexical diversity index across tokens.
2. **Mean Word Length**: Average token character footprint.
3. **Burstiness Variance**: Standard deviation of sentence lengths across the passage.
4. **Punctuation Density**: Syntactic separator distribution frequency.
5. **Mean Sentence Length**: Average words per clause structure.
6. **Informal Discourse Fillers**: Human conversational markers (`actually`, `tbh`, `kinda`, `basically`).
7. **Formal Discourse Connectives**: Hallmark transition terms common in LLMs (`furthermore`, `moreover`, `consequently`, `thereby`).
8. **Contraction Frequency**: Natural spoken reductions (`don't`, `it's`, `can't`, `won't`).

---

## ✨ Features

- 📑 **Instant PDF Extraction**: In-browser client-side text parsing supporting assignment and research PDFs.
- 🎯 **Dropzone Workspace**: Drag-and-drop file upload with real-time feedback and sample presets.
- 🌈 **Granular Sentence Heatmap**: Visual color-coded per-sentence confidence progress indicators.
- 📊 **Forensic Score Badge**: High-legibility tabular rating with clear status indicator.
- 📄 **Exportable Forensic PDF**: Formal verification certificate ready for academic documentation.
- ⚡ **Ultra-Fast Local Inference**: Lightweight scikit-learn pipeline (sub-100ms response time).
- 🖱️ **Keyboard Shortcuts**: `Ctrl+Enter` / `Cmd+Enter` to analyze instantly.
- 🖥️ **One-Click Orchestration**: Automated `start.bat` and `stop.bat` scripts for seamless operations.

---

## 🚀 Quick Start (Local Setup)

### Option A: One-Click Startup (Windows)
Double-click [`start.bat`](start.bat) in the project root. It will automatically initialize the FastAPI backend, launch the Vite frontend, and open your browser at `http://localhost:5173`.

To cleanly terminate all servers, run [`stop.bat`](stop.bat).

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/harshfly/Verifio-V2.git
cd Verifio-V2

# Install backend dependencies
pip install -r backend/requirements.txt

# Download required NLTK tokenizer resources
python -c "import nltk; nltk.download('punkt_tab')"

# Launch FastAPI development server
cd backend
python -m uvicorn main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`

---

## 📡 REST API Reference

### `POST /api/analyze`
Analyzes raw text and returns sentence-by-sentence confidence scores alongside overall document classification.

#### Request Body
```json
{
  "text": "The implementation of advanced machine learning algorithms has consequently revolutionized modern industry."
}
```

#### Response Body
```json
{
  "sentences": [
    {
      "sentence": "The implementation of advanced machine learning algorithms has consequently revolutionized modern industry.",
      "score": 0.9547
    }
  ],
  "overall_score": 0.9547
}
```

### `GET /health`
```json
{
  "status": "ok"
}
```

---

## 🗂️ Project Architecture

```
Verifio-V2/
├── backend/
│   ├── main.py                  # FastAPI application entry & CORS middleware
│   ├── schemas.py               # Pydantic request/response models
│   ├── requirements.txt         # Production Python dependencies
│   ├── Dockerfile               # Production container definition
│   ├── routers/
│   │   └── analyze.py           # POST /api/analyze route handler
│   ├── pipeline/
│   │   ├── perplexity.py        # Predictability heuristic analysis
│   │   ├── burstiness.py        # Sentence cadence and length variance
│   │   ├── classifier.py        # 8-feature ML inference engine
│   │   └── fusion.py            # Weighted multi-signal fusion
│   └── models/
│       ├── train_classifier.py  # Model training pipeline
│       └── model.pkl            # Pretrained LogisticRegression artifact
├── frontend/
│   ├── index.html               # Semantic HTML entry with SEO & OpenGraph tags
│   ├── package.json             # NPM dependencies
│   ├── tailwind.config.js       # Design tokens & typography config
│   ├── public/
│   │   └── logo.png             # Official Verifio brand mark
│   └── src/
│       ├── App.jsx              # Application root
│       ├── index.css            # Clean modern design rules
│       ├── pages/
│       │   └── Home.jsx         # Primary verification workspace layout
│       ├── components/
│       │   ├── TextInput.jsx    # PDF dropzone, text area & controls
│       │   ├── SentenceHeatmap.jsx # Sentence-level color-coded heatmap
│       │   ├── ScoreBadge.jsx   # Document classification rating
│       │   ├── DownloadReport.jsx # Forensic PDF export generator
│       │   └── Loader.jsx       # Real-time analysis status indicator
│       └── utils/
│           ├── api.js           # Axios HTTP client configuration
│           └── colorScale.js    # Verdict boundary color definitions
├── start.bat                    # One-click Windows launch orchestrator
├── stop.bat                     # Clean shutdown script
└── README.md                    # Documentation & project specifications
```

---

## 👨‍💻 Creator & Maintainer

**Verifio V2** was designed and developed by **Harsh Malviya**.

- 👤 **Author**: Harsh Malviya
- 📧 **Email**: [harshhmalviya09@gmail.com](mailto:harshhmalviya09@gmail.com)
- 🐙 **GitHub**: [@harshfly](https://github.com/harshfly)
- 💼 **Project Repository**: [harshfly/Verifio-V2](https://github.com/harshfly/Verifio-V2)

For questions, academic collaboration, feature requests, or security reports, please reach out via [email](mailto:harshhmalviya09@gmail.com).

---

## 📄 License

This project is licensed under the **MIT License** — free for academic, personal, and commercial usage with attribution.
