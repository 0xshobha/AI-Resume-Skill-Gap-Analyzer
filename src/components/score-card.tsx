'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  description,
  size = 'md',
}: ScoreCardProps) {
  const percentage = Math.round((score / maxScore) * 100);

  const getColor = () => {
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStrokeColor = () => {
    if (percentage >= 70) return '#22c55e';
    if (percentage >= 50) return '#eab308';
    return '#ef4444';
  };

  const sizes = {
    sm: { container: 'w-24 h-24', stroke: 8, font: 'text-xl' },
    md: { container: 'w-32 h-32', stroke: 10, font: 'text-2xl' },
    lg: { container: 'w-40 h-40', stroke: 12, font: 'text-3xl' },
  };

  const sizeConfig = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={cn('relative', sizeConfig.container)}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={sizeConfig.stroke}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={sizeConfig.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', sizeConfig.font, getColor())}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/ {maxScore}</span>
        </div>
      </div>
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
