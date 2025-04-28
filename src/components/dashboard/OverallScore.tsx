
interface OverallScoreProps {
  score: number;
  grade: string;
}

const OverallScore = ({ score, grade }: OverallScoreProps) => {
  return (
    <div className="flex items-center gap-4">
      <div>
        <div className="text-5xl font-bold text-cyber-foreground">{score}</div>
        <div className="text-sm text-cyber-muted-foreground mt-1">Overall Security Score</div>
      </div>
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-cyber-accent flex items-center justify-center">
          <span className="text-xl font-bold text-cyber-foreground">{grade}</span>
        </div>
      </div>
    </div>
  );
};

export default OverallScore;
