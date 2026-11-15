export default function ScoreBadge({
  score,
  aiCount = 0,
  uncertainCount = 0,
  humanCount = 0,
  total = 0,
}) {
  // Compute percentage of sentences in each category
  const aiPct = total > 0 ? Math.round((aiCount / total) * 100) : Math.round(score * 100);
  const uncPct = total > 0 ? Math.round((uncertainCount / total) * 100) : 0;
  const humanPct = total > 0 ? Math.round((humanCount / total) * 100) : Math.round((1 - score) * 100);

  // Determine the dominant (maximum %) verdict
  let label = "Likely Human";
  let percent = humanPct;
  let color = "text-green-600";
  let dot = "bg-green-500";

  if (total > 0) {
    if (humanPct >= aiPct && humanPct >= uncPct) {
      label = "Likely Human";
      percent = humanPct;
      color = "text-green-600";
      dot = "bg-green-500";
    } else if (aiPct >= humanPct && aiPct >= uncPct) {
      label = "Likely AI-Generated";
      percent = aiPct;
      color = "text-red-600";
      dot = "bg-red-500";
    } else {
      label = "Uncertain / Mixed";
      percent = uncPct;
      color = "text-orange-500";
      dot = "bg-orange-400";
    }
  } else {
    // Fallback if counts are not provided
    if (score < 0.35) {
      label = "Likely Human";
      percent = Math.round((1 - score) * 100);
      color = "text-green-600";
      dot = "bg-green-500";
    } else if (score >= 0.65) {
      label = "Likely AI-Generated";
      percent = Math.round(score * 100);
      color = "text-red-600";
      dot = "bg-red-500";
    } else {
      label = "Uncertain / Mixed";
      percent = Math.round(score * 100);
      color = "text-orange-500";
      dot = "bg-orange-400";
    }
  }

  return (
    <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3.5">
      <div
        className={`text-[36px] xs:text-[42px] sm:text-[48px] font-extrabold tabular-nums tracking-tighter leading-none ${color}`}
      >
        {percent}
        <span className="text-[18px] xs:text-[22px] sm:text-[24px] font-semibold ml-0.5">
          %
        </span>
      </div>
      <div className="flex items-center gap-1.5 pb-0.5">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-[12px] sm:text-[13px] text-neutral-800 font-semibold tracking-tight">
          {label}
        </span>
      </div>
    </div>
  );
}
