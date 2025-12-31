'use client';

import * as React from 'react';
import {
  FileText,
  Sparkles,
  Shield,
  Target,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { FileUploader } from '@/components/file-uploader';
import { JobDescriptionInput } from '@/components/job-description-input';
import { AnalysisReport } from '@/components/analysis-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ResumeAnalysis, FileUploadState } from '@/lib/types';
import { extractText, cleanupOCR } from '@/lib/ocr-service';
import { analyzeResume } from '@/lib/gemini-service';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Analysis',
    description: 'Get intelligent feedback powered by Google Gemini AI',
  },
  {
    icon: Shield,
    title: 'ATS Compatibility',
    description: 'Ensure your resume passes applicant tracking systems',
  },
  {
    icon: Target,
    title: 'Job Matching',
    description: 'Compare your resume against specific job descriptions',
  },
  {
    icon: FileText,
    title: 'Detailed Reports',
    description: 'Download comprehensive PDF analysis reports',
  },
];

export default function Home() {
  const [uploadState, setUploadState] = React.useState<FileUploadState>({
    file: null,
    status: 'idle',
    progress: 0,
  });
  const [jobDescription, setJobDescription] = React.useState('');
  const [analysis, setAnalysis] = React.useState<ResumeAnalysis | null>(null);

  // Cleanup OCR worker on component unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      cleanupOCR();
    };
  }, []);

  const handleFileSelect = async (file: File) => {
    setUploadState({
      file,
      status: 'extracting',
      progress: 20,
    });

    try {
      // Step 1: Extract text from file
      setUploadState((prev) => ({
        ...prev,
        status: 'extracting',
        progress: 30,
      }));

      const extractedText = await extractText(file);

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error(
          'Could not extract enough text from the file. Please ensure the document contains readable text.'
        );
      }

      // Step 2: Analyze with Gemini
      setUploadState((prev) => ({
        ...prev,
        status: 'analyzing',
        progress: 60,
      }));

      const result = await analyzeResume(
        extractedText,
        jobDescription.trim() || undefined
      );

      setUploadState((prev) => ({
        ...prev,
        status: 'complete',
        progress: 100,
      }));

      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setUploadState({
        file: null,
        status: 'error',
        progress: 0,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      });
    }
  };

  const handleReset = () => {
    setUploadState({
      file: null,
      status: 'idle',
      progress: 0,
    });
    setJobDescription('');
    setAnalysis(null);
  };

  const getStatusText = () => {
    switch (uploadState.status) {
      case 'extracting':
        return 'Extracting text from document...';
      case 'analyzing':
        return 'Analyzing resume with AI...';
      case 'complete':
        return 'Analysis complete!';
      default:
        return '';
    }
  };

  const isLoading = ['extracting', 'analyzing'].includes(uploadState.status);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AI Resume Analyzer</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        {/* Show analysis results or upload interface */}
        {analysis ? (
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6">
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Analyze Another Resume
              </Button>
            </div>
            <AnalysisReport analysis={analysis} />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Analyze Your Resume with{' '}
                <span className="text-primary">AI</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Get instant feedback on your resume&apos;s quality, ATS
                compatibility, and job match potential using advanced AI
                analysis.
              </p>
            </section>

            {/* Upload Section */}
            <section className="container mx-auto max-w-2xl px-4 pb-16">
              {uploadState.status === 'error' && (
                <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-destructive">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{uploadState.error}</p>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              <Card>
                <CardContent className="space-y-6 pt-6">
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    isLoading={isLoading}
                    progress={uploadState.progress}
                    status={getStatusText()}
                  />

                  {!isLoading && uploadState.status !== 'complete' && (
                    <JobDescriptionInput
                      value={jobDescription}
                      onChange={setJobDescription}
                      disabled={isLoading}
                    />
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Features Section */}
            <section className="border-t bg-muted/30 py-16">
              <div className="container mx-auto px-4">
                <h2 className="mb-12 text-center text-3xl font-bold">
                  What You&apos;ll Get
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {features.map((feature) => (
                    <Card
                      key={feature.title}
                      className="text-center transition-shadow hover:shadow-md"
                    >
                      <CardContent className="pt-6">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 font-semibold">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="container mx-auto px-4 py-16">
              <h2 className="mb-12 text-center text-3xl font-bold">
                How It Works
              </h2>
              <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
                {[
                  { step: '1', text: 'Upload your resume (PDF or image)' },
                  { step: '2', text: 'Optionally add a job description' },
                  { step: '3', text: 'Get detailed AI analysis' },
                ].map((item, index) => (
                  <React.Fragment key={item.step}>
                    <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {item.step}
                      </div>
                      <span className="font-medium">{item.text}</span>
                    </div>
                    {index < 2 && (
                      <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by Google Gemini AI • Your resume data is processed securely
            and not stored.
          </p>
        </div>
      </footer>
    </div>
  );
}
