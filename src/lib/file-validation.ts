import { FileValidationResult, ACCEPTED_FILE_TYPES, MAX_FILE_SIZES } from './types';

/**
 * Validates a file for upload
 * - PDF files: up to 10MB
 * - Image files (PNG, JPG, JPEG): up to 5MB
 */
export function validateFile(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file type
  const fileType = file.type.toLowerCase();
  const isValidType = ACCEPTED_FILE_TYPES.includes(fileType as typeof ACCEPTED_FILE_TYPES[number]);

  if (!isValidType) {
    return {
      valid: false,
      error: `Unsupported file format. Please upload a PDF, PNG, JPG, or JPEG file.`,
    };
  }

  // Check file size based on type
  const isPDF = fileType === 'application/pdf';
  const maxSize = isPDF ? MAX_FILE_SIZES.pdf : MAX_FILE_SIZES.image;
  const maxSizeMB = isPDF ? '10MB' : '5MB';

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${maxSizeMB}. Please upload a smaller file.`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'The file appears to be empty. Please select a valid file.',
    };
  }

  return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || getFileExtension(file.name) === 'pdf';
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || ['png', 'jpg', 'jpeg'].includes(getFileExtension(file.name));
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
