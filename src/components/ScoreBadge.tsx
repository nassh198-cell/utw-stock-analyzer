interface ScoreBadgeProps {
  score: number;
  grade: string;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, grade, size = "md" }: ScoreBadgeProps) {
  const getColor = () => {
    if (grade === "A+" || grade === "A") return "bg-emerald-600/20 text-emerald-400 border-emerald-600/30";
    if (grade === "B+" || grade === "B") return "bg-blue-600/20 text-blue-400 border-blue-600/30";
    if (grade === "C+" || grade === "C") return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
    if (grade === "D") return "bg-orange-600/20 text-orange-400 border-orange-600/30";
    return "bg-red-600/20 text-red-400 border-red-600/30";
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-4 py-2 text-lg" : "px-3 py-1 text-sm";

  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border ${getColor()} ${sizeClasses}`}>
      <span className="font-bold">{grade}</span>
      <span className="opacity-80">{score}</span>
    </div>
  );
}
