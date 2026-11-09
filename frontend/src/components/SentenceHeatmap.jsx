import { useState } from "react";

export default function SentenceHeatmap({ sentences }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

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

  return (
    <div className="space-y-0 divide-y divide-neutral-100">
      {sentences.map((item, idx) => {
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
  );
}
