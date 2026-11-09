import { useState, useRef } from "react";

const SAMPLES = [
  {
    label: "AI Sample",
    text: "The implementation of advanced machine learning algorithms has consequently revolutionized numerous sectors of modern industry. Furthermore, the integration of natural language processing technologies has subsequently enabled organizations to streamline their operational workflows with remarkable efficiency. Additionally, the systematic deployment of predictive analytics models has thereby facilitated more informed decision-making processes across diverse organizational hierarchies."
  },
  {
    label: "Human Sample",
    text: "I honestly wasn't sure what to write for this assignment at first. The topic seemed kinda boring when I read it, but then I started looking into it and actually found some really interesting stuff. My roommate thought I was crazy staying up until 2am reading about it, but I couldn't stop. I think that's the thing about research — you never know what you'll find."
  },
  {
    label: "Mixed Sample",
    text: "I was honestly surprised by the results. The implementation of advanced neural network architectures has consequently enabled unprecedented improvements in diagnostic accuracy. My friend told me about it last week, and I couldn't believe it at first. Furthermore, the systematic integration of machine learning frameworks has subsequently facilitated more efficient data processing workflows."
  }
];

export default function TextInput({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = () => {
    if (text.trim().length < 10) return;
    onSubmit(text);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  const processPDF = async (file) => {
    if (!file || file.type !== "application/pdf") return;
    setFileName(file.name);
    setPdfLoading(true);
    setText("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs", import.meta.url
      ).toString();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item) => item.str).join(" ") + " ";
      }
      setText(fullText.trim());
    } catch (err) {
      setText("");
      setFileName(null);
      setPageCount(null);
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePDFUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      processPDF(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processPDF(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const clearAll = () => {
    setText("");
    setFileName(null);
    setPageCount(null);
  };

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div
      className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-200 bg-white/95 backdrop-blur-md shadow-xl shadow-orange-950/5 p-3 sm:p-5 ${
        dragOver
          ? "border-orange-500 ring-4 ring-orange-100 shadow-2xl"
          : "border-neutral-200/90 hover:border-orange-200/80"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handlePDFUpload}
      />

      {/* ── Top Responsive Toolbar (Mobile swipeable) ──────────── */}
      <div className="flex items-center justify-between gap-2 pb-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Upload PDF Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || pdfLoading}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white text-[12px] sm:text-[13px] font-semibold rounded-xl shadow-2xs shadow-orange-500/25 transition-all disabled:opacity-60 cursor-pointer shrink-0"
          >
            {pdfLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span>Upload PDF</span>
              </>
            )}
          </button>

          {/* Quick Samples (swipeable horizontally on phones) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setText(s.text);
                  setFileName(null);
                  setPageCount(null);
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-[11px] sm:text-[12px] font-medium text-neutral-700 rounded-xl border border-neutral-200/80 shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {s.label === "AI Sample" && (
                  <svg className="w-3 h-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Drop Hint */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="hidden md:flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-neutral-800 cursor-pointer font-medium ml-auto shrink-0 select-none transition-colors"
          title="Click to browse or drag PDF anywhere"
        >
          <svg className="w-4 h-4 text-neutral-400 stroke-[1.8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
          </svg>
          <span>Drop PDF anywhere</span>
        </div>
      </div>

      {/* ── Active PDF Banner ─────────────────────────────────── */}
      {fileName && (
        <div className="mt-2.5 flex items-center justify-between gap-2 px-3 sm:px-3.5 py-2 bg-orange-50/90 border border-orange-200/80 rounded-xl text-orange-950 text-[11px] sm:text-[12px] animate-fade-in">
          <div className="flex items-center gap-1.5 sm:gap-2 font-medium min-w-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate font-semibold text-neutral-900">{fileName}</span>
            {pageCount && (
              <span className="text-orange-700 text-[10px] sm:text-[11px] shrink-0 font-medium">
                ({pageCount}p)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-orange-700 hover:text-black hover:bg-orange-100 px-2 py-0.5 rounded-md transition-colors shrink-0 text-[11px] font-semibold"
          >
            Remove
          </button>
        </div>
      )}

      {/* ── Inner Textarea Box ─────────────────────────────────── */}
      <div className="relative my-2.5 sm:my-3 rounded-xl sm:rounded-2xl border border-neutral-200/80 bg-white/70 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 transition-all p-2.5 sm:p-4 min-h-[140px] sm:min-h-[160px]">
        <textarea
          className="w-full h-[125px] sm:h-[150px] bg-transparent text-neutral-900 text-[16px] sm:text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none resize-none transition-colors"
          placeholder="Paste assignment or paper text here, or drop a PDF directly into this box..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || pdfLoading}
          spellCheck={false}
        />

        {/* Drag Overlay visual */}
        {dragOver && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-orange-500 rounded-xl m-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13" />
              </svg>
            </div>
            <p className="text-neutral-900 font-semibold text-[12px] sm:text-[14px]">Drop PDF to extract text</p>
          </div>
        )}

        {/* Clear Button */}
        {text && !dragOver && (
          <button
            type="button"
            onClick={clearAll}
            title="Clear all text"
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Bottom Responsive Bar ─────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[12px] text-neutral-500 font-medium tabular-nums shrink-0">
          <span>{wordCount} words</span>
          <span className="text-neutral-300">·</span>
          <span>{charCount} chars</span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || pdfLoading || text.trim().length < 10}
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white text-[12px] sm:text-[14px] font-bold rounded-xl shadow-md shadow-orange-500/25 transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Text</span>
              <svg className="w-3.5 sm:w-4 h-3.5 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
