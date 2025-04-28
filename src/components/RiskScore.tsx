import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, ShieldCheck, AlertCircle, AlertOctagon } from 'lucide-react';

interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskScore = ({ score, size = 'md', showLabel = true }: RiskScoreProps) => {
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.setProperty('--score-dash', `${(score / 1000) * 283}`);
    }
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score <= 250) return 'text-green-400';
    if (score <= 500) return 'text-yellow-400';
    if (score <= 750) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score <= 250) return 'from-green-500/30 to-green-500/10';
    if (score <= 500) return 'from-yellow-500/30 to-yellow-500/10';
    if (score <= 750) return 'from-orange-500/30 to-orange-500/10';
    return 'from-red-500/30 to-red-500/10';
  };

  const getScoreBorder = (score: number) => {
    if (score <= 250) return 'border-green-500/50';
    if (score <= 500) return 'border-yellow-500/50';
    if (score <= 750) return 'border-orange-500/50';
    return 'border-red-500/50';
  };

  const getScoreIcon = (score: number) => {
    if (score <= 250) return <ShieldCheck className="w-6 h-6" />;
    if (score <= 500) return <AlertCircle className="w-6 h-6" />;
    if (score <= 750) return <AlertTriangle className="w-6 h-6" />;
    return <AlertOctagon className="w-6 h-6" />;
  };

  const getScoreLabel = (score: number) => {
    if (score <= 250) return 'Safe';
    if (score <= 500) return 'Suspicious';
    if (score <= 750) return 'High Risk';
    return 'Critical';
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-28 h-28',
          score: 'text-2xl',
          label: 'text-xs',
          icon: 'w-4 h-4',
        };
      case 'lg':
        return {
          container: 'w-52 h-52',
          score: 'text-6xl',
          label: 'text-xl',
          icon: 'w-8 h-8',
        };
      default:
        return {
          container: 'w-36 h-36',
          score: 'text-4xl',
          label: 'text-sm',
          icon: 'w-6 h-6',
        };
    }
  };

  const sizeClasses = getSizeClasses(size);
  const scoreColor = getScoreColor(score);
  const scoreBackground = getScoreBackground(score);
  const scoreBorder = getScoreBorder(score);
  const scoreLabel = getScoreLabel(score);
  const scoreIcon = getScoreIcon(score);

  return (
    <div className="relative group">
      <div
        className={cn(
          'relative rounded-full flex flex-col items-center justify-center',
          'transition-all duration-500 ease-out group-hover:scale-105',
          'border-2',
          scoreBorder,
          sizeClasses.container,
          'bg-gradient-to-br backdrop-blur-sm',
          scoreBackground,
          'shadow-lg animate-score-pulse'
        )}
      >
        {/* Icon */}
        <div className={cn('absolute top-4', scoreColor)}>
          {scoreIcon}
        </div>

        {/* Score */}
        <div className={cn('font-bold mt-4', scoreColor, sizeClasses.score)}>
          {score}
        </div>

        {/* Label */}
        {showLabel && (
          <div className={cn('text-muted-foreground mt-1 font-medium', sizeClasses.label)}>
            {scoreLabel}
          </div>
        )}

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            className="opacity-20"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            ref={ringRef}
            className={cn(scoreColor, 'animate-score-ring')}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray="0 283"
            style={{ '--score-dash': `${(score / 1000) * 283}` } as React.CSSProperties}
          />
        </svg>
      </div>
      
      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-2xl opacity-0 transition-opacity duration-500',
          'group-hover:opacity-30',
          scoreBackground
        )}
      />
      
      {/* Pulse animation */}
      <div
        className={cn(
          'absolute inset-0 rounded-full animate-ping-slow',
          scoreBackground,
          'opacity-0 group-hover:opacity-30'
        )}
      />
    </div>
  );
};

export default RiskScore; 