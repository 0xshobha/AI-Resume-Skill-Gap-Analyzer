'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

interface SkillsListProps {
  skills: string[];
  missingSkills?: string[];
}

export function SkillsList({ skills, missingSkills }: SkillsListProps) {
  return (
    <div className="space-y-4">
      {/* Identified Skills */}
      <div>
        <h4 className="mb-2 text-sm font-medium">Identified Skills</h4>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No specific skills were identified in the resume.
          </p>
        )}
      </div>

      {/* Missing Skills */}
      {missingSkills && missingSkills.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-500">
            Missing from Job Description
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill, index) => (
              <Badge key={index} variant="outline" className="border-yellow-500/50 text-yellow-600 dark:text-yellow-500">
                + {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
