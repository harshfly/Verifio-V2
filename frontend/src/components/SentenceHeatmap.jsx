import { useState, useEffect } from "react";

const PAGE_SIZE = 50;

export default function SentenceHeatmap({ sentences }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sentences]);

  const getConfig = (score) => {
    if (score < 0.35) return { bar: "bg-green-500", text: "text-green-600", label: "Human" };
    if (score < 0.65) return { bar: "bg-orange-400", text: "text-orange-600", label: "Uncertain" };
    return { bar: "bg-red-500", text: "text-red-600", label: "AI" };
  };

  const copySentence = (sentence, idx) => {
    navigator.clipboard.writeText(sentence);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const visibleSentences = sentences.slice(0, visibleCount);
  const remaining = sentences.length - visibleCount;

  return (
    <div className="space-y-3">
      <div className="space-y-0 divide-y divide-neutral-100">
        {visibleSentences.map((item, idx) => {
          const config = getConfig(item.score);
          const percent = Math.round(item.score * 100);

          return (
            <div
              key={idx}
              onClick={() => copySentence(item.sentence, idx)}
              title="Click to copy sentence"
              className={`group flex items-start gap-2 sm:gap-3 py-2.5 sm:py-3.5 first:pt-0 last:pb-0 animate-fade-up stagger-${Math.min(
                idx + 1,
                8
              )} cursor-pointer hover:bg-neutral-50/60 rounded-lg px-1.5 -mx-1.5 transition-colors`}
            >
              {/* Left: Index + color dot */}
              <div className="flex flex-col items-center pt-0.5 shrink-0 w-5 sm:w-6">
                <span className="text-[10px] sm:text-[11px] tabular-nums text-neutral-400 font-mono">
                  {idx + 1}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${config.bar}`} />
              </div>

              {/* Center: Sentence Text */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-neutral-800 break-words">
                  {item.sentence}
                </p>
                {copiedIdx === idx && (
                  <span className="inline-block text-[10px] text-green-600 font-medium mt-1 animate-fade-in">
                    ✓ Copied to clipboard
                  </span>
                )}
              </div>

              {/* Right: Confidence Score & Bar */}
              <div className="shrink-0 flex items-center gap-2 pt-0.5">
                <div className="w-10 md:w-14 bg-neutral-150 rounded-full h-[3px] overflow-hidden hidden xs:block">
                  <div
                    className={`h-full rounded-full ${config.bar} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span
                  className={`text-[11px] sm:text-[12px] font-bold tabular-nums ${config.text} w-7 sm:w-8 text-right`}
                >
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── See More Lines Pagination ───────────────────── */}
      {sentences.length > PAGE_SIZE && (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200/80">
          <p className="text-[12px] text-neutral-500 font-medium">
            Showing <span className="font-semibold text-neutral-800">{visibleSentences.length}</span> of{" "}
            <span className="font-semibold text-neutral-800">{sentences.length}</span> lines
          </p>

          <div className="flex items-center gap-2.5">
            {remaining > 0 ? (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sentences.length))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 text-[12px] sm:text-[13px] font-semibold rounded-xl border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-all cursor-pointer"
              >
                <span>See more lines</span>
                <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-md font-semibold">
                  +{Math.min(PAGE_SIZE, remaining)}
                </span>
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setVisibleCount(PAGE_SIZE)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-black text-[12px] font-medium rounded-xl border border-neutral-200 transition-all cursor-pointer"
              >
                <span>Show less</span>
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
            )}

            {remaining > PAGE_SIZE && (
              <button
                type="button"
                onClick={() => setVisibleCount(sentences.length)}
                className="text-[12px] text-orange-600 hover:text-orange-700 font-semibold px-2 py-1 transition-colors cursor-pointer"
              >
                Show all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
