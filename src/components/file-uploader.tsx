'use client';

import * as React from 'react';
import { Upload, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile, formatFileSize, isPDFFile } from '@/lib/file-validation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  progress?: number;
  status?: string;
}

export function FileUploader({
  onFileSelect,
  isLoading,
  progress = 0,
  status,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isLoading && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragging ? 'Drop your resume here' : 'Drag & drop your resume'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse files
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>PDF (up to 10MB)</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span>PNG, JPG (up to 5MB)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Selected File */}
      {selectedFile && !isLoading && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            {isPDFFile(selectedFile) ? (
              <FileText className="h-8 w-8 text-red-500" />
            ) : (
              <ImageIcon className="h-8 w-8 text-blue-500" />
            )}
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isLoading && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="font-medium">{status || 'Processing...'}</p>
              <Progress value={progress} className="mt-2 h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isLoading && (
        <Button onClick={handleUpload} className="w-full" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Analyze Resume
        </Button>
      )}
    </div>
  );
}
