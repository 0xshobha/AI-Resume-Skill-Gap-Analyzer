'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const MAX_CHARS = 5000;

export function JobDescriptionInput({
  value,
  onChange,
  disabled = false,
}: JobDescriptionInputProps) {
  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="job-description" className="text-sm font-medium">
          Job Description{' '}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <span
          className={`text-xs ${
            isOverLimit ? 'text-destructive' : 'text-muted-foreground'
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>
      <Textarea
        id="job-description"
        placeholder="Paste the job description here to get personalized matching analysis and keyword suggestions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[120px] resize-none"
      />
      <p className="text-xs text-muted-foreground">
        Adding a job description enables job match scoring and identifies missing
        keywords from the job posting.
      </p>
    </div>
  );
}
