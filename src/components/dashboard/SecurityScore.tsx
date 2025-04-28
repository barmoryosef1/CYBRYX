
import { cn } from "@/lib/utils";

interface SecurityScoreProps {
  category: string;
  score: number;
  change?: number;
  color: string;
}

const SecurityScore = ({ category, score, change, color }: SecurityScoreProps) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-cyber-foreground">{category}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-cyber-foreground">
            {score}
          </span>
          {change !== undefined && (
            <span
              className={cn(
                "text-xs font-medium",
                change > 0 ? "text-cyber-clean" : "text-cyber-alert-high"
              )}
            >
              {change > 0 ? `+${change}` : change}
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-cyber-muted rounded-full h-2.5">
        <div
          className={cn("h-2.5 rounded-full", color)}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SecurityScore;
