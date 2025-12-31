'use client';

import { isPDFFile, isImageFile } from './file-validation';

// Tesseract.js worker for OCR
let tesseractWorker: Tesseract.Worker | null = null;

// Track if PDF.js has been configured
let pdfjsConfigured = false;

/**
 * Initialize Tesseract worker
 */
async function initTesseract() {
  if (tesseractWorker) return tesseractWorker;

  const Tesseract = await import('tesseract.js');
  tesseractWorker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  return tesseractWorker;
}

/**
 * Configure PDF.js with proper settings
 */
async function configurePdfjs() {
  if (pdfjsConfigured) return;

  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source to local path
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/workers/pdf.worker.min.mjs';

  pdfjsConfigured = true;
}

/**
 * Check if an error is a PDF.js font-related error
 */
function isFontError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('font') ||
      message.includes('offset mismatch') ||
      message.includes('fontinfo') ||
      message.includes('glyph') ||
      message.includes('cmap') ||
      message.includes('cidfontype') ||
      message.includes('formateerror') ||
      message.includes('missingdata')
    );
  }
  return false;
}

/**
 * Extract text from an image file using Tesseract.js OCR
 */
export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const worker = await initTesseract();

    // Convert file to data URL
    const dataUrl = await fileToDataURL(file);

    // Perform OCR
    const { data: { text } } = await worker.recognize(dataUrl);

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the image. Please ensure the image contains readable text.');
    }

    return text.trim();
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a PDF file using PDF.js with robust error handling
 * Falls back to OCR if font-related errors occur
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    await configurePdfjs();
    const pdfjsLib = await import('pdfjs-dist');

    // Load the PDF file with options to handle problematic fonts
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      // Disable font face loading to avoid font-related errors
      disableFontFace: true,
      // Use standard fonts as fallback
      useSystemFonts: true,
      // Disable streaming for better error handling
      disableStream: true,
      // Disable auto fetch for embedded resources
      disableAutoFetch: true,
    });

    // Add error handler for the loading task
    loadingTask.onPassword = () => {
      throw new Error('This PDF is password protected. Please upload an unprotected PDF.');
    };

    let pdf;
    try {
      pdf = await loadingTask.promise;
    } catch (loadError) {
      console.warn('PDF loading failed, falling back to OCR:', loadError);
      // If loading fails due to font issues, fall back to OCR
      if (isFontError(loadError)) {
        console.log('Font-related error detected, using OCR fallback...');
        return await extractTextFromPDFWithOCR(file);
      }
      throw loadError;
    }

    let fullText = '';
    let hasTextContent = false;
    let fontErrorOccurred = false;

    // Extract text from each page with individual error handling
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({
          // Normalize whitespace
          includeMarkedContent: false,
        });

        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (pageText.length > 0) {
          hasTextContent = true;
          fullText += pageText + '\n';
        }
      } catch (pageError) {
        console.warn(`Error extracting text from page ${i}:`, pageError);

        // Check if it's a font-related error
        if (isFontError(pageError)) {
          fontErrorOccurred = true;
          console.log(`Font error on page ${i}, will use OCR for this PDF`);
          break;
        }
        // Continue to next page for other types of errors
      }
    }

    // If font errors occurred, fall back to OCR for the entire document
    if (fontErrorOccurred) {
      console.log('Font errors detected during extraction, falling back to OCR...');
      return await extractTextFromPDFWithOCR(file);
    }

    const cleanedText = fullText.trim();

    // If no text found, the PDF might be image-based, try OCR
    if (!hasTextContent || cleanedText.length === 0) {
      console.log('No text found in PDF, attempting OCR...');
      return await extractTextFromPDFWithOCR(file);
    }

    // Validate that we got meaningful text (not just garbage)
    if (cleanedText.length < 50 || !containsReadableText(cleanedText)) {
      console.log('Extracted text appears corrupted, falling back to OCR...');
      return await extractTextFromPDFWithOCR(file);
    }

    return cleanedText;
  } catch (error) {
    console.error('PDF extraction error:', error);

    // For font-related errors, try OCR as fallback
    if (isFontError(error)) {
      console.log('Font error caught, attempting OCR fallback...');
      try {
        return await extractTextFromPDFWithOCR(file);
      } catch (ocrError) {
        console.error('OCR fallback also failed:', ocrError);
        throw new Error('Failed to extract text from PDF. The document may have compatibility issues. Please try a different file or format.');
      }
    }

    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if text contains readable content (not corrupted data)
 */
function containsReadableText(text: string): boolean {
  // Check for a reasonable ratio of alphanumeric characters
  const alphanumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const totalLength = text.length;

  if (totalLength === 0) return false;

  // At least 40% should be readable characters
  const readableRatio = alphanumericCount / totalLength;

  // Also check for common words
  const commonWords = ['the', 'and', 'for', 'with', 'experience', 'skills', 'work', 'education'];
  const lowerText = text.toLowerCase();
  const hasCommonWords = commonWords.some(word => lowerText.includes(word));

  return readableRatio > 0.4 || hasCommonWords;
}

/**
 * Extract text from image-based PDF using OCR
 * This is used as a fallback when PDF.js text extraction fails
 */
async function extractTextFromPDFWithOCR(file: File): Promise<string> {
  try {
    await configurePdfjs();
    const pdfjsLib = await import('pdfjs-dist');

    const arrayBuffer = await file.arrayBuffer();

    // Load with minimal font processing for rendering
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      disableFontFace: true,
      useSystemFonts: true,
      disableStream: true,
      disableAutoFetch: true,
    }).promise;

    let fullText = '';
    const worker = await initTesseract();

    // Process each page as an image
    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const scale = 2; // Higher scale for better OCR accuracy
        const viewport = page.getViewport({ scale });

        // Create canvas to render PDF page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          // Render with white background
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);

          try {
            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            } as Parameters<typeof page.render>[0]).promise;
          } catch (renderError) {
            console.warn(`Render error on page ${i}, trying with lower quality:`, renderError);
            // Try with lower scale if rendering fails
            const lowScale = 1;
            const lowViewport = page.getViewport({ scale: lowScale });
            canvas.height = lowViewport.height;
            canvas.width = lowViewport.width;
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({
              canvasContext: context,
              viewport: lowViewport,
              canvas: canvas,
            } as Parameters<typeof page.render>[0]).promise;
          }

          // Convert canvas to image and run OCR
          const imageData = canvas.toDataURL('image/png');
          const { data: { text } } = await worker.recognize(imageData);
          fullText += text + '\n';
        }
      } catch (pageError) {
        console.warn(`Failed to process page ${i} for OCR:`, pageError);
        // Continue with other pages
      }
    }

    const result = fullText.trim();

    if (!result || result.length < 20) {
      throw new Error('Could not extract readable text from the PDF. The document may be empty or heavily corrupted.');
    }

    return result;
  } catch (error) {
    console.error('PDF OCR error:', error);
    throw new Error('Failed to extract text from PDF. Please try with a different file or convert it to an image format.');
  }
}

/**
 * Extract text from any supported file type
 */
export async function extractText(file: File): Promise<string> {
  if (isPDFFile(file)) {
    return extractTextFromPDF(file);
  } else if (isImageFile(file)) {
    return extractTextFromImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image file.');
  }
}

/**
 * Convert file to data URL
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Cleanup Tesseract worker
 */
export async function cleanupOCR() {
  if (tesseractWorker) {
    await tesseractWorker.terminate();
    tesseractWorker = null;
  }
}
