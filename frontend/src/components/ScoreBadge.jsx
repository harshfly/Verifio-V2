export default function ScoreBadge({ score }) {
  const percent = Math.round(score * 100);

  const getConfig = () => {
    if (score < 0.35) return { label: "Human", color: "text-green-600", dot: "bg-green-500" };
    if (score < 0.65) return { label: "Uncertain", color: "text-orange-500", dot: "bg-orange-400" };
    return { label: "AI-generated", color: "text-red-600", dot: "bg-red-500" };
  };

  const config = getConfig();

  return (
    <div className="flex items-baseline gap-3">
      <span className={`text-[48px] font-bold tabular-nums tracking-tighter ${config.color}`}>
        {percent}
        <span className="text-[24px] font-semibold">%</span>
      </span>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        <span className="text-[13px] text-neutral-700 font-medium">{config.label}</span>
      </div>
    </div>
  );
}
