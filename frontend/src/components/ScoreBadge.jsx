export default function ScoreBadge({ score }) {
  const percent = Math.round(score * 100);

  const getConfig = () => {
    if (score < 0.35) return { label: "Likely Human", color: "text-green-600", dot: "bg-green-500", bg: "bg-green-50 text-green-700 border-green-200" };
    if (score < 0.65) return { label: "Uncertain / Mixed", color: "text-orange-500", dot: "bg-orange-400", bg: "bg-orange-50 text-orange-700 border-orange-200" };
    return { label: "Likely AI-Generated", color: "text-red-600", dot: "bg-red-500", bg: "bg-red-50 text-red-700 border-red-200" };
  };

  const config = getConfig();

  return (
    <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
      <div className={`text-[36px] xs:text-[42px] sm:text-[48px] font-extrabold tabular-nums tracking-tighter leading-none ${config.color}`}>
        {percent}
        <span className="text-[18px] xs:text-[22px] sm:text-[24px] font-semibold ml-0.5">%</span>
      </div>
      <div className="flex items-center gap-1.5 pb-0.5">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span className="text-[12px] sm:text-[13px] text-neutral-800 font-semibold tracking-tight">{config.label}</span>
      </div>
    </div>
  );
}
