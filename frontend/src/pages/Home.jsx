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
  const [pricingOpen, setPricingOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
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
    <div className="min-h-screen relative flex flex-col antialiased selection:bg-orange-100 selection:text-orange-900 w-full overflow-x-hidden">

      {/* ── Fixed Atmospheric Background ─────────────── */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-cover bg-center sm:bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
        aria-hidden="true"
      />

      {/* ── Navbar ──────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-neutral-200/50">
        <div className="max-w-[960px] mx-auto px-3.5 sm:px-6 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <img
              src="/logo.png?v=2"
              alt="Verifio Logo"
              className="h-7 sm:h-8 md:h-9 w-auto object-contain cursor-pointer"
              onClick={() => {
                setResult(null);
                setError(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {/* Center Capsule Navigation (desktop only) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/90 border border-neutral-200/80 p-1 rounded-full shadow-2xs">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-3.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 transition-colors"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3.5 py-1 text-xs font-medium text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3.5 py-1 text-xs font-medium text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => setPricingOpen(true)}
              className="px-3.5 py-1 text-xs font-medium text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              Pricing
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="hidden xs:inline-flex text-xs font-medium text-neutral-700 hover:text-black px-3.5 sm:px-4 py-1.5 rounded-full border border-neutral-200/90 hover:border-neutral-300 bg-white/80 shadow-2xs transition-all cursor-pointer"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.querySelector("textarea");
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
              }}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-white px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xs shadow-orange-400/30 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ──────────────────── */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-3.5 sm:px-6">

        {/* ── Hero ────────────────────────────────────── */}
        <section className="pt-6 sm:pt-10 md:pt-12 pb-5 sm:pb-8">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5 sm:mb-4">
            <span className="text-[10px] sm:text-[12px] font-bold text-orange-500 uppercase tracking-wider">
              AI TEXT DETECTION
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-neutral-200/90 text-[10px] sm:text-[12px] font-semibold text-neutral-800 shadow-2xs">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              93.4% Test Accuracy
            </span>
          </div>

          <h1 className="text-[26px] xs:text-[32px] sm:text-[44px] md:text-[52px] font-extrabold text-black leading-[1.14] sm:leading-[1.1] tracking-[-0.035em] mb-2.5 sm:mb-4">
            Detect what's written<br />
            by AI,{" "}
            <span className="relative inline-block text-orange-500">
              sentence by sentence.
              <svg
                className="absolute -bottom-1.5 sm:-bottom-2.5 left-0 w-full h-2.5 sm:h-3.5 overflow-visible pointer-events-none"
                viewBox="0 0 280 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8.5C65 14 185 14 277 4.5"
                  stroke="#FF6B00"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-[13px] sm:text-[15px] md:text-[16px] text-neutral-600 leading-relaxed max-w-[560px]">
            Paste text or drop an assignment PDF to get forensic confidence scoring.
            Powered by statistical perplexity, burstiness, and an 8-feature ML ensemble.
          </p>
        </section>

        {/* ── Input Workspace ─────────────────────────── */}
        <section className="pb-6 sm:pb-8">
          <TextInput onSubmit={handleSubmit} loading={loading} />
        </section>

        {/* ── Error Banner ────────────────────────────── */}
        {error && (
          <div className="pb-5 sm:pb-6 animate-fade-up">
            <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] sm:text-[13px] flex items-start gap-2.5">
              <span className="shrink-0 text-base">⚠️</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading Animation ───────────────────────── */}
        {loading && (
          <div className="pb-8 sm:pb-10">
            <Loader />
          </div>
        )}

        {/* ── Results Section ─────────────────────────── */}
        {result && !loading && (
          <section ref={resultsRef} className="pb-12 sm:pb-16 animate-fade-up space-y-5 sm:space-y-8">
            <div className="border-t border-neutral-200/80" />

            {/* Results Header: Score + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
              <div>
                <p className="text-[10px] sm:text-[12px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-1">
                  Document Verdict
                </p>
                <ScoreBadge score={result.overall_score} />
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto sm:mt-1">
                <DownloadReport result={result} />
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-[11px] sm:text-[12px] text-neutral-600 hover:text-black transition-colors px-2.5 sm:px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-400 bg-white shadow-2xs cursor-pointer font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Stat Summary Cards */}
            <div className="grid grid-cols-3 gap-px bg-neutral-200/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xs border border-neutral-200/80">
              {[
                { label: "AI Flagged", value: aiCount, total: result.sentences.length, color: "text-red-600" },
                { label: "Uncertain", value: uncertainCount, total: result.sentences.length, color: "text-orange-500" },
                { label: "Human", value: humanCount, total: result.sentences.length, color: "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white p-2.5 sm:p-4 text-center">
                  <p className={`text-[18px] xs:text-[22px] sm:text-[28px] font-bold tabular-nums tracking-tight ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-[10px] sm:text-[12px] text-neutral-600 font-medium mt-0.5 whitespace-nowrap truncate">
                    {s.label}
                  </p>
                  <p className="text-[9px] sm:text-[11px] text-neutral-400 mt-0.5">
                    {s.total > 0 ? Math.round((s.value / s.total) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>

            {/* Diagnostic Summary Callout */}
            {result.overall_score >= 0.65 && (
              <div className="pl-3 sm:pl-3.5 border-l-2 border-red-500 bg-red-50/50 py-2 sm:py-2.5 pr-3 rounded-r-lg">
                <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-red-600">High AI probability ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {aiCount} of {result.sentences.length} sentences exhibit hallmark synthetic language patterns — elevated lexical formality, uniform sentence length, and low burstiness.
                </p>
              </div>
            )}
            {result.overall_score >= 0.35 && result.overall_score < 0.65 && (
              <div className="pl-3 sm:pl-3.5 border-l-2 border-orange-400 bg-orange-50/50 py-2 sm:py-2.5 pr-3 rounded-r-lg">
                <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-orange-600">Mixed signals ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  Detected {aiCount} AI-flagged and {humanCount} human sentences. Typical of co-authored, AI-assisted, or heavily paraphrased student work.
                </p>
              </div>
            )}
            {result.overall_score < 0.35 && (
              <div className="pl-3 sm:pl-3.5 border-l-2 border-green-500 bg-green-50/50 py-2 sm:py-2.5 pr-3 rounded-r-lg">
                <p className="text-[12px] sm:text-[13px] text-neutral-700 leading-relaxed">
                  <span className="font-semibold text-green-600">Likely human-written ({Math.round(result.overall_score * 100)}%).</span>{" "}
                  {humanCount} of {result.sentences.length} sentences reflect organic linguistic structure, conversational filler cadence, and natural variation.
                </p>
              </div>
            )}

            {/* Heatmap Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 sm:pt-2">
              <p className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-[0.1em]">
                Sentence Breakdown ({result.sentences.length})
              </p>
              <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] text-neutral-600">
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-green-500" />Human</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-orange-400" />Uncertain</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-[3px] rounded-full bg-red-500" />AI</span>
              </div>
            </div>

            {/* Sentence Heatmap Table */}
            <SentenceHeatmap sentences={result.sentences} />

            {/* Model Provenance Note */}
            <div className="pt-3.5 sm:pt-4 border-t border-neutral-200/80 text-[10px] sm:text-[11px] text-neutral-500 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 sm:gap-2">
              <span>Model: 8-feature LogisticRegression · 93.4% test accuracy</span>
              <span>3-Signal Fusion: Perplexity + Burstiness + ML</span>
            </div>
          </section>
        )}

        {/* ── How It Works (Landing State) ────────────── */}
        {!result && !loading && (
          <section id="how-it-works" className="pb-12 sm:pb-16 scroll-mt-20">
            <div className="border-t border-neutral-200/80 pt-6 sm:pt-10">
              <p className="text-[10px] sm:text-[12px] font-bold text-orange-500 uppercase tracking-[0.15em] mb-3.5 sm:mb-6">
                How It Works
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
                {[
                  { num: "01", title: "Submit Text or PDF", desc: "Paste your document or drop assignment PDFs directly. Client-side parsing keeps data local and fast." },
                  { num: "02", title: "3-Signal Forensic Scan", desc: "Every sentence is analyzed for statistical perplexity, burstiness length variance, and 8 linguistic indicators." },
                  { num: "03", title: "Actionable Intelligence", desc: "Review granular sentence-level color confidence heatmaps and export tamper-proof forensic PDF reports." },
                ].map((item) => (
                  <div key={item.num} className="bg-white/80 backdrop-blur-xs p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-neutral-200/80 shadow-2xs space-y-1 sm:space-y-1.5 transition-all hover:bg-white hover:border-orange-200">
                    <p className="text-[10px] sm:text-[11px] font-bold text-orange-500 font-mono tracking-wider">{item.num}</p>
                    <h3 className="text-[13px] sm:text-[14px] font-bold text-black">{item.title}</h3>
                    <p className="text-[12px] sm:text-[13px] text-neutral-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="border-t border-neutral-200/70 py-4 sm:py-6 px-3.5 sm:px-6 bg-white/70 backdrop-blur-xs mt-auto">
        <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <img src="/logo.png?v=2" alt="Verifio" className="h-5 sm:h-7 w-auto object-contain" />
          <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">AI Text Detection for Academic Integrity</p>
        </div>
      </footer>

      {/* ── Mobile PWA Install Banner ───────────────── */}
      <PWAInstallPrompt />

      {/* ── Interactive Pricing Modal ───────────────── */}
      {pricingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-neutral-200 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-orange-500">Free Tier</span>
              <button
                onClick={() => setPricingOpen(false)}
                className="text-neutral-400 hover:text-black text-sm px-2 py-1 rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-black">100% Free for Everyone</h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Verifio V2 is open-source and completely free for students, educators, and researchers. No subscriptions, credit cards, or scan quotas.
            </p>
            <div className="space-y-2 py-1 sm:py-2">
              {["Unlimited text scans", "PDF document parser", "Sentence-by-sentence heatmap", "Forensic PDF reports", "Zero data retention / 100% Private"].map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs text-neutral-700">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPricingOpen(false)}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Start Scanning Now
            </button>
          </div>
        </div>
      )}

      {/* ── Interactive Auth Modal ──────────────────── */}
      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-neutral-200 text-center space-y-3.5 sm:space-y-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-black">Instant Anonymous Access</h2>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Verifio V2 does not require an account or login. Your text and PDFs are processed in real-time and never saved to a database.
            </p>
            <button
              onClick={() => setAuthOpen(false)}
              className="w-full py-2.5 bg-neutral-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Continue to Scanner
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
