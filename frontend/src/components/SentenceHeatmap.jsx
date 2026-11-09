export default function SentenceHeatmap({ sentences }) {
  const getConfig = (score) => {
    if (score < 0.35) return { bar: "bg-green-500", text: "text-green-600", label: "Human" };
    if (score < 0.65) return { bar: "bg-orange-400", text: "text-orange-600", label: "Uncertain" };
    return { bar: "bg-red-500", text: "text-red-600", label: "AI" };
  };

  return (
    <div className="space-y-0 divide-y divide-neutral-100">
      {sentences.map((item, idx) => {
        const config = getConfig(item.score);
        const percent = Math.round(item.score * 100);

        return (
          <div
            key={idx}
            className={`group flex gap-3 py-3 first:pt-0 last:pb-0 animate-fade-up stagger-${Math.min(idx + 1, 8)}`}
          >
            {/* Left: color indicator */}
            <div className="flex flex-col items-center pt-1 shrink-0 w-5">
              <span className="text-[10px] tabular-nums text-neutral-400">{idx + 1}</span>
              <div className={`w-[3px] h-[3px] rounded-full mt-1 ${config.bar}`} />
            </div>

            {/* Center: sentence text */}
            <p className="flex-1 text-[13px] leading-relaxed text-neutral-700 min-w-0">
              {item.sentence}
            </p>

            {/* Right: score */}
            <div className="shrink-0 flex items-baseline gap-2 pt-0.5">
              <div className="w-12 bg-neutral-100 rounded-full h-[3px] overflow-hidden hidden sm:block mt-2">
                <div
                  className={`h-full rounded-full ${config.bar} transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className={`text-[12px] font-semibold tabular-nums ${config.text} w-8 text-right`}>
                {percent}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
