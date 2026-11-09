import { useEffect, useState } from "react";

const STEPS = [
  "Tokenizing",
  "Perplexity analysis",
  "Burstiness scoring",
  "ML classifier",
  "Fusing signals",
  "Finalizing",
];

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 10 + 3;
      if (current > 95) current = 95;
      setProgress(Math.round(current));
      setStepIdx(Math.min(Math.floor(current / 18), STEPS.length - 1));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-12">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 rounded-full border border-neutral-200" />
          <div className="absolute inset-0 rounded-full border border-orange-500 border-t-transparent animate-spin" />
        </div>
        <span className="text-[13px] text-neutral-600">{STEPS[stepIdx]}</span>
        <span className="text-[11px] text-neutral-500 tabular-nums ml-auto">{progress}%</span>
      </div>
      <div className="w-full bg-neutral-100 rounded-full h-[3px] overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
