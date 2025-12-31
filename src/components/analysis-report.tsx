'use client';

import * as React from 'react';
import {
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Shield,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
} from 'lucide-react';
import { ResumeAnalysis } from '@/lib/types';
import { downloadPDFReport } from '@/lib/report-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScoreCard } from './score-card';
import { SkillsList } from './skills-list';

interface AnalysisReportProps {
  analysis: ResumeAnalysis;
}

const sectionIcons = {
  contact: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Wrench,
};

const sectionLabels = {
  contact: 'Contact Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills Section',
};

export function AnalysisReport({ analysis }: AnalysisReportProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [downloadError, setDownloadError] = React.useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadPDFReport(analysis, 'resume-analysis-report.pdf');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'format':
        return <Wrench className="h-4 w-4" />;
      case 'keywords':
        return <Lightbulb className="h-4 w-4" />;
      case 'structure':
        return <Shield className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analysis Results</h2>
          <p className="text-sm text-muted-foreground">
            Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString()}
          </p>
          {downloadError && (
            <p className="text-sm text-destructive mt-1">{downloadError}</p>
          )}
        </div>
        <Button onClick={handleDownload} variant="outline" disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download PDF'}
        </Button>
      </div>

      {/* Score Cards */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <ScoreCard
              title="Overall Score"
              score={analysis.overallScore}
              size="lg"
              description="Resume quality rating"
            />
            <ScoreCard
              title="ATS Score"
              score={analysis.atsScore}
              size="lg"
              description="ATS compatibility"
            />
            {analysis.jobMatchScore !== undefined && (
              <ScoreCard
                title="Job Match"
                score={analysis.jobMatchScore}
                size="lg"
                description="Job description match"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="improvements">Improvements</TabsTrigger>
          <TabsTrigger value="ats">ATS Issues</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          {Object.entries(analysis.sections).map(([key, section]) => {
            const Icon = sectionIcons[key as keyof typeof sectionIcons];
            const label = sectionLabels[key as keyof typeof sectionLabels];

            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-lg">{label}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.present ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Missing
                        </Badge>
                      )}
                      <Badge variant="outline">{section.score}/100</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {section.feedback}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsList
                skills={analysis.skills.identified}
                missingSkills={analysis.skills.missing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements" className="space-y-4">
          {analysis.improvements.length > 0 ? (
            analysis.improvements.map((improvement, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${getPriorityColor(
                        improvement.priority
                      )}`}
                    />
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(improvement.category)}
                      <CardTitle className="text-lg">
                        {improvement.title}
                      </CardTitle>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Badge variant="outline">{improvement.category}</Badge>
                      <Badge
                        variant={
                          improvement.priority === 'high'
                            ? 'destructive'
                            : improvement.priority === 'medium'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {improvement.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{improvement.description}</p>
                  {improvement.example && (
                    <div className="rounded-md bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Example:
                      </p>
                      <p className="text-sm italic">{improvement.example}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 font-medium">Great job!</p>
                <p className="text-sm text-muted-foreground">
                  No major improvements needed.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ATS Issues Tab */}
        <TabsContent value="ats" className="space-y-4">
          {analysis.atsIssues.length > 0 ? (
            analysis.atsIssues.map((issue, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        issue.impact === 'high'
                          ? 'text-red-500'
                          : issue.impact === 'medium'
                          ? 'text-yellow-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <CardTitle className="text-lg">{issue.issue}</CardTitle>
                    <Badge
                      variant={
                        issue.impact === 'high'
                          ? 'destructive'
                          : issue.impact === 'medium'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="ml-auto"
                    >
                      {issue.impact} impact
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md bg-green-500/10 p-3">
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">
                      Solution:
                    </p>
                    <p className="text-sm">{issue.solution}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 font-medium">ATS Ready!</p>
                <p className="text-sm text-muted-foreground">
                  Your resume appears to be ATS-friendly.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
