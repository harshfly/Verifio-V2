import { useRef } from "react";
import jsPDF from "jspdf";
import { scoreToLabel } from "../utils/colorScale";

export default function DownloadReport({ result }) {
  const generating = useRef(false);

  const handleDownload = async () => {
    if (generating.current) return;
    generating.current = true;

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Header
    pdf.setFillColor(17, 17, 17);
    pdf.rect(0, 0, pageWidth, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("Verifio", margin, 14);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(160, 160, 160);
    pdf.text(`AI Text Detection Report · ${new Date().toLocaleDateString()}`, margin, 22);
    y = 40;

    // Overall score
    const percent = Math.round(result.overall_score * 100);
    const label = scoreToLabel(result.overall_score);
    pdf.setTextColor(17, 17, 17);
    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${percent}%`, margin, y + 5);
    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`${label} · ${result.sentences.length} sentences analyzed`, margin + 30, y + 5);
    y += 18;

    // Divider
    pdf.setDrawColor(230, 230, 230);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Sentences
    pdf.setTextColor(120, 120, 120);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.text("SENTENCE ANALYSIS", margin, y);
    y += 6;

    result.sentences.forEach((item, idx) => {
      if (y > 270) { pdf.addPage(); y = 20; }

      const sentPercent = Math.round(item.score * 100);
      const color = item.score < 0.35 ? [5, 150, 105] : item.score < 0.65 ? [217, 119, 6] : [220, 38, 38];

      // Color bar
      pdf.setFillColor(...color);
      pdf.rect(margin, y, 1.5, 12, "F");

      // Number
      pdf.setTextColor(180, 180, 180);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${idx + 1}`, margin + 4, y + 5);

      // Text
      const truncated = item.sentence.length > 130 ? item.sentence.substring(0, 130) + "…" : item.sentence;
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(7.5);
      pdf.text(truncated, margin + 10, y + 5, { maxWidth: pageWidth - margin * 2 - 30 });

      // Score
      pdf.setTextColor(...color);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.text(`${sentPercent}%`, pageWidth - margin - 8, y + 5);

      y += 15;
    });

    // Footer
    if (y > 270) { pdf.addPage(); y = 20; }
    pdf.setDrawColor(230, 230, 230);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 5;
    pdf.setTextColor(180, 180, 180);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text("Verifio V2 · Built by Harsh Malviya (harshhmalviya09@gmail.com) · 93.4% Accuracy", margin, y);

    pdf.save(`verifio-report-${Date.now()}.pdf`);
    generating.current = false;
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors px-3 py-1.5 rounded-md border border-neutral-150 hover:border-neutral-300"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Export PDF
    </button>
  );
}
