import { useState, useRef } from "react";

const SAMPLES = [
  {
    label: "AI sample",
    text: "The implementation of advanced machine learning algorithms has consequently revolutionized numerous sectors of modern industry. Furthermore, the integration of natural language processing technologies has subsequently enabled organizations to streamline their operational workflows with remarkable efficiency. Additionally, the systematic deployment of predictive analytics models has thereby facilitated more informed decision-making processes across diverse organizational hierarchies."
  },
  {
    label: "Human sample",
    text: "I honestly wasn't sure what to write for this assignment at first. The topic seemed kinda boring when I read it, but then I started looking into it and actually found some really interesting stuff. My roommate thought I was crazy staying up until 2am reading about it, but I couldn't stop. I think that's the thing about research — you never know what you'll find."
  },
  {
    label: "Mixed sample",
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
      className={`rounded-2xl border transition-all duration-200 bg-white shadow-sm overflow-hidden ${
        dragOver
          ? "border-orange-500 ring-4 ring-orange-100/80 shadow-lg"
          : "border-neutral-200 hover:border-neutral-300"
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

      {/* ── Top Toolbar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-neutral-50/90 border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Engaging Upload PDF Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || pdfLoading}
            className="group relative inline-flex items-center gap-2 px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-[13px] font-semibold rounded-lg shadow-sm shadow-orange-300/40 hover:shadow transition-all disabled:opacity-60 cursor-pointer"
          >
            {pdfLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Extracting PDF...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 transition-transform group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <span>Upload PDF</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-orange-600/70 text-orange-100 rounded">
                  Fast
                </span>
              </>
            )}
          </button>

          {/* Dot Separator */}
          <span className="text-neutral-300 font-bold select-none">·</span>

          {/* Samples */}
          <div className="flex items-center gap-1">
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
                className="text-[12px] font-medium text-neutral-600 hover:text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-md transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status / Hint */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span className="hidden md:inline">Drag & drop PDF anywhere</span>
        </div>
      </div>

      {/* ── Active PDF Banner (if loaded) ────────────────────── */}
      {fileName && (
        <div className="flex items-center justify-between px-4 py-2 bg-orange-50/80 border-b border-orange-100 text-orange-950 text-[12px] animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="truncate max-w-[280px] sm:max-w-md font-semibold text-neutral-900">{fileName}</span>
            {pageCount && (
              <span className="text-orange-700 text-[11px]">
                ({pageCount} {pageCount === 1 ? "page" : "pages"} extracted)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="text-orange-700 hover:text-black hover:bg-orange-100 px-2 py-0.5 rounded transition-colors"
          >
            Remove file
          </button>
        </div>
      )}

      {/* ── Textarea Area ───────────────────────────────────────── */}
      <div className="relative">
        <textarea
          className="w-full h-[190px] p-4 bg-transparent text-neutral-900 text-[14px] leading-relaxed placeholder:text-neutral-400 focus:outline-none resize-none transition-colors"
          placeholder="Paste assignment or paper text here, or drop a PDF directly into this box..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || pdfLoading}
          spellCheck={false}
        />

        {/* Drag Overlay visual */}
        {dragOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none border-2 border-dashed border-orange-500 m-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13" />
              </svg>
            </div>
            <p className="text-neutral-900 font-semibold text-[14px]">Drop your PDF to extract text</p>
            <p className="text-neutral-500 text-[12px] mt-0.5">We process assignments and papers locally</p>
          </div>
        )}

        {/* Clear Button inside text area */}
        {text && !dragOver && (
          <button
            type="button"
            onClick={clearAll}
            title="Clear all text"
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Bottom Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50/50 border-t border-neutral-150">
        <div className="flex items-center gap-3 text-[12px] text-neutral-500 tabular-nums">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <span className="text-neutral-300">·</span>
          <span>{charCount} characters</span>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || pdfLoading || text.trim().length < 10}
          className="inline-flex items-center gap-2 px-5 py-2 bg-neutral-900 hover:bg-black active:bg-neutral-950 text-white text-[13px] font-semibold rounded-lg shadow-sm transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze Text</span>
              <span className="text-[10px] text-neutral-400 font-mono bg-neutral-800 px-1.5 py-0.5 rounded">
                ⌘↵
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
