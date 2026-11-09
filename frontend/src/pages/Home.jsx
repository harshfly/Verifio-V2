import { useState, useRef } from "react";
import TextInput from "../components/TextInput";
import SentenceHeatmap from "../components/SentenceHeatmap";
import ScoreBadge from "../components/ScoreBadge";
import Loader from "../components/Loader";
import DownloadReport from "../components/DownloadReport";
import { analyzeText } from "../utils/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const handleSubmit = async (text) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeText(text);
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError("Failed to connect to the API. Make sure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const aiCount = result?.sentences.filter(s => s.score >= 0.65).length || 0;
  const humanCount = result?.sentences.filter(s => s.score < 0.35).length || 0;
  const uncertainCount = result?.sentences.filter(s => s.score >= 0.35 && s.score < 0.65).length || 0;

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ──────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-[720px] mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=2" alt="Verifio" className="h-10 w-auto object-contain drop-shadow-xs" />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-neutral-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              API Ready
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-orange-50 text-orange-600 border border-orange-200">
              93.4% Accuracy
            </span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-[12px] text-neutral-500 hover:text-orange-600 transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="pt-16 pb-10 px-5">
        <div className="max-w-[720px] mx-auto">
          <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-[0.15em] mb-4">
            AI Text Detection
          </p>
          <h1 className="text-[40px] md:text-[52px] font-extrabold text-black leading-[1.08] tracking-[-0.035em] mb-4">
            Detect what's written<br />by AI, sentence by&nbsp;sentence.
          </h1>
          <p className="text-[16px] text-neutral-600 leading-relaxed max-w-[480px] mb-10">
            Paste any text and get a confidence score for each sentence.
            Built on a 3-signal ML pipeline with 93.4% accuracy.
          </p>
        </div>
      </section>

      {/* ── Input ───────────────────────────────────── */}
      <section className="px-5 pb-8">
        <div className="max-w-[720px] mx-auto">
          <TextInput onSubmit={handleSubmit} loading={loading} />
        </div>
      </section>

      {/* ── Error ───────────────────────────────────── */}
      {error && (
        <div className="max-w-[720px] mx-auto px-5 pb-6 animate-fade-up">
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
            {error}
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────── */}
      {loading && (
        <div className="max-w-[720px] mx-auto px-5">
          <Loader />
        </div>
      )}

      {/* ── Results ─────────────────────────────────── */}
      {result && !loading && (
        <section ref={resultsRef} className="px-5 pb-16 animate-fade-up">
          <div className="max-w-[720px] mx-auto">

            {/* Divider */}
            <div className="border-t border-neutral-200 mb-8" />

            {/* Score Row */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-[0.15em] mb-2">
                  Overall Result
                </p>
                <ScoreBadge score={result.overall_score} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <DownloadReport result={result} />
                <button
                  onClick={() => setResult(null)}
                  className="text-[12px] text-neutral-600 hover:text-black transition-colors px-3 py-1.5 rounded-md border border-neutral-200 hover:border-neutral-400"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-3 gap-px bg-neutral-200 rounded-lg overflow-hidden mb-8">
              {[
                { label: "AI-generated", value: aiCount, total: result.sentences.length, color: "text-red-600" },
                { label: "Uncertain", value: uncertainCount, total: result.sentences.length, color: "text-orange-500" },
                { label: "Human-written", value: humanCount, total: result.sentences.length, color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-4 text-center">
                  <p className={`text-[28px] font-bold tabular-nums tracking-tight ${s.color}`}>{s.value}</p>
                  <p className="text-[12px] text-neutral-600 mt-0.5">{s.label}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {s.total > 0 ? Math.round((s.value / s.total) * 100) : 0}% of {s.total}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            {result.overall_score >= 0.65 && (
              <div className="mb-8 pl-3 border-l-2 border-red-500">
                <p className="text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-red-600">High AI probability ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {aiCount} of {result.sentences.length} sentences show patterns consistent with AI-generated text — formal vocabulary, uniform structure, and low burstiness.
                </p>
              </div>
            )}
            {result.overall_score >= 0.35 && result.overall_score < 0.65 && (
              <div className="mb-8 pl-3 border-l-2 border-orange-400">
                <p className="text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-orange-600">Mixed signals ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {aiCount} AI-flagged and {humanCount} human sentences found. This text may be partially AI-assisted or heavily edited.
                </p>
              </div>
            )}
            {result.overall_score < 0.35 && (
              <div className="mb-8 pl-3 border-l-2 border-green-500">
                <p className="text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-green-600">Likely human-written ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {humanCount} of {result.sentences.length} sentences show natural variation in structure and casual language patterns.
                </p>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-5 mb-5">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.1em]">Sentences</p>
              <div className="flex items-center gap-4 text-[11px] text-neutral-600">
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-green-500" />Human</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-orange-400" />Uncertain</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-red-500" />AI</span>
              </div>
            </div>

            {/* Heatmap */}
            <SentenceHeatmap sentences={result.sentences} />

            {/* Model info */}
            <div className="mt-8 pt-6 border-t border-neutral-200 text-[11px] text-neutral-500">
              8-feature LogisticRegression · 93.4% test accuracy · Perplexity + Burstiness + ML Classifier
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ────────────────────────────── */}
      {!result && !loading && (
        <section className="px-5 pb-16">
          <div className="max-w-[720px] mx-auto">
            <div className="border-t border-neutral-200 pt-12">
              <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-[0.15em] mb-6">
                How it works
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { num: "1", title: "Paste or upload", desc: "Paste text directly or upload a PDF — we'll extract the content automatically." },
                  { num: "2", title: "Multi-signal analysis", desc: "Each sentence is scored by perplexity analysis, burstiness measurement, and an 8-feature classifier." },
                  { num: "3", title: "Review results", desc: "See per-sentence confidence scores with a color-coded breakdown and export a detailed report." },
                ].map((item) => (
                  <div key={item.num}>
                    <p className="text-[12px] font-bold text-orange-400 mb-2">{item.num.padStart(2, '0')}</p>
                    <h3 className="text-[14px] font-semibold text-black mb-1.5">{item.title}</h3>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-neutral-200 py-6 px-5">
        <div className="max-w-[720px] mx-auto flex items-center justify-between">
          <img src="/logo.png?v=2" alt="Verifio" className="h-7 w-auto object-contain" />
          <p className="text-[11px] text-neutral-500">AI Text Detection for Academic Integrity</p>
        </div>
      </footer>
    </div>
  );
}
