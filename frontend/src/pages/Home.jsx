import { useState, useRef } from "react";
import TextInput from "../components/TextInput";
import SentenceHeatmap from "../components/SentenceHeatmap";
import ScoreBadge from "../components/ScoreBadge";
import Loader from "../components/Loader";
import DownloadReport from "../components/DownloadReport";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
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
      setError("Failed to connect to the analysis engine. Please ensure the backend service is running.");
    } finally {
      setLoading(false);
    }
  };

  const aiCount = result?.sentences.filter(s => s.score >= 0.65).length || 0;
  const humanCount = result?.sentences.filter(s => s.score < 0.35).length || 0;
  const uncertainCount = result?.sentences.filter(s => s.score >= 0.35 && s.score < 0.65).length || 0;

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased selection:bg-orange-100 selection:text-orange-900">

      {/* ── Navbar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img
              src="/logo.png?v=2"
              alt="Verifio Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-neutral-500 font-medium">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Engine Online
            </div>
            <span className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold bg-orange-50 text-orange-600 border border-orange-200/80 whitespace-nowrap">
              93.4% Accuracy
            </span>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] sm:text-[12px] text-neutral-500 hover:text-black transition-colors px-1"
            >
              API Docs
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ──────────────────── */}
      <main className="flex-1 w-full max-w-[760px] mx-auto px-4 sm:px-6">

        {/* ── Hero ────────────────────────────────────── */}
        <section className="pt-8 sm:pt-14 pb-6 sm:pb-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-bold text-orange-500 uppercase tracking-[0.16em] mb-2 sm:mb-3">
            <span>AI Text Detection</span>
          </div>

          <h1 className="text-[28px] xs:text-[34px] sm:text-[44px] md:text-[50px] font-extrabold text-black leading-[1.12] sm:leading-[1.08] tracking-[-0.035em] mb-3 sm:mb-4">
            Detect what's written<br />
            by AI, <span className="text-orange-500">sentence by sentence.</span>
          </h1>

          <p className="text-[14px] sm:text-[15px] md:text-[16px] text-neutral-600 leading-relaxed max-w-[540px]">
            Paste text or drop an assignment PDF to get forensic confidence scoring.
            Powered by statistical perplexity, burstiness, and an 8-feature ML ensemble.
          </p>
        </section>

        {/* ── Input Workspace ─────────────────────────── */}
        <section className="pb-8">
          <TextInput onSubmit={handleSubmit} loading={loading} />
        </section>

        {/* ── Error Banner ────────────────────────────── */}
        {error && (
          <div className="pb-6 animate-fade-up">
            <div className="p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] sm:text-[13px] flex items-start gap-2.5">
              <span className="shrink-0 text-base">⚠️</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading Animation ───────────────────────── */}
        {loading && (
          <div className="pb-10">
            <Loader />
          </div>
        )}

        {/* ── Results Section ─────────────────────────── */}
        {result && !loading && (
          <section ref={resultsRef} className="pb-16 animate-fade-up space-y-6 sm:space-y-8">
            <div className="border-t border-neutral-200/80" />

            {/* Results Header: Score + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-[11px] sm:text-[12px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-1.5">
                  Document Verdict
                </p>
                <ScoreBadge score={result.overall_score} />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto sm:mt-1">
                <DownloadReport result={result} />
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-[12px] text-neutral-600 hover:text-black transition-colors px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white shadow-2xs"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Stat Summary Cards */}
            <div className="grid grid-cols-3 gap-px bg-neutral-200/80 rounded-xl overflow-hidden shadow-2xs border border-neutral-200/80">
              {[
                { label: "AI Flagged", value: aiCount, total: result.sentences.length, color: "text-red-600" },
                { label: "Uncertain", value: uncertainCount, total: result.sentences.length, color: "text-orange-500" },
                { label: "Human", value: humanCount, total: result.sentences.length, color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-3 sm:p-4 text-center">
                  <p className={`text-[20px] xs:text-[24px] sm:text-[28px] font-bold tabular-nums tracking-tight ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-neutral-600 font-medium mt-0.5 whitespace-nowrap truncate">
                    {s.label}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5">
                    {s.total > 0 ? Math.round((s.value / s.total) * 100) : 0}% of total
                  </p>
                </div>
              ))}
            </div>

            {/* Diagnostic Summary Callout */}
            {result.overall_score >= 0.65 && (
              <div className="pl-3.5 border-l-2 border-red-500 bg-red-50/30 py-2 pr-3 rounded-r-lg">
                <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-red-600">High AI probability ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {aiCount} of {result.sentences.length} sentences exhibit hallmark synthetic language patterns — elevated lexical formality, uniform sentence length, and low burstiness.
                </p>
              </div>
            )}
            {result.overall_score >= 0.35 && result.overall_score < 0.65 && (
              <div className="pl-3.5 border-l-2 border-orange-400 bg-orange-50/30 py-2 pr-3 rounded-r-lg">
                <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-orange-600">Mixed signals ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  Detected {aiCount} AI-flagged and {humanCount} human sentences. Typical of co-authored, AI-assisted, or heavily paraphrased student work.
                </p>
              </div>
            )}
            {result.overall_score < 0.35 && (
              <div className="pl-3.5 border-l-2 border-green-500 bg-green-50/30 py-2 pr-3 rounded-r-lg">
                <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-green-600">Likely human-written ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {humanCount} of {result.sentences.length} sentences reflect organic linguistic structure, conversational filler cadence, and natural variation.
                </p>
              </div>
            )}

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">
                Sentence Breakdown ({result.sentences.length})
              </p>
              <div className="flex items-center gap-3 text-[11px] text-neutral-600">
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-green-500" />Human</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-orange-400" />Uncertain</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-red-500" />AI</span>
              </div>
            </div>

            {/* Sentence Heatmap Table */}
            <SentenceHeatmap sentences={result.sentences} />

            {/* Model Provenance Note */}
            <div className="pt-4 border-t border-neutral-200/80 text-[11px] text-neutral-500 flex flex-wrap items-center justify-between gap-2">
              <span>Model: 8-feature LogisticRegression · 93.4% test accuracy</span>
              <span>3-Signal Fusion: Perplexity + Burstiness + ML</span>
            </div>
          </section>
        )}

        {/* ── How It Works (Landing State) ────────────── */}
        {!result && !loading && (
          <section className="pb-16">
            <div className="border-t border-neutral-200/80 pt-8 sm:pt-12">
              <p className="text-[11px] sm:text-[12px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-4 sm:mb-6">
                How It Works
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {[
                  { num: "01", title: "Submit Text or PDF", desc: "Paste your document or drop assignment PDFs directly. Client-side parsing keeps data local and fast." },
                  { num: "02", title: "3-Signal Forensic Scan", desc: "Every sentence is analyzed for statistical perplexity, burstiness length variance, and 8 linguistic indicators." },
                  { num: "03", title: "Actionable Intelligence", desc: "Review granular sentence-level color confidence heatmaps and export tamper-proof forensic PDF reports." },
                ].map((item) => (
                  <div key={item.num} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-orange-500 font-mono tracking-wider">{item.num}</p>
                    <h3 className="text-[14px] font-bold text-black">{item.title}</h3>
                    <p className="text-[13px] text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-neutral-200/80 py-5 sm:py-6 px-4 sm:px-6 bg-white mt-auto">
        <div className="max-w-[760px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <img src="/logo.png?v=2" alt="Verifio" className="h-6 sm:h-7 w-auto object-contain" />
          <p className="text-[11px] text-neutral-500">AI Text Detection for Academic Integrity</p>
        </div>
      </footer>

      {/* ── Mobile PWA Install Banner ───────────────── */}
      <PWAInstallPrompt />
    </div>
  );
}
