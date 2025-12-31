# AI Resume & Skill Gap Analyzer

An AI-powered resume analyzer web application built with Next.js that allows users to upload their resumes (PDF/images), extracts text using OCR, and provides intelligent analysis and feedback using Google's Gemini API.

![AI Resume Analyzer](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)

## Features

- **Resume Upload**: Support for PDF and image files (PNG, JPG, JPEG)
- **OCR Text Extraction**: Extract text from scanned PDFs and images using Tesseract.js
- **AI-Powered Analysis**: Detailed resume analysis using Google Gemini AI
- **ATS Compatibility Score**: Check how well your resume performs with Applicant Tracking Systems
- **Job Matching**: Compare your resume against specific job descriptions
- **Improvement Suggestions**: Actionable recommendations with priority levels
- **PDF Reports**: Download comprehensive analysis reports
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/0xshobha/AI-Resume-Skill-Gap-Analyzer.git
cd AI-Resume-Skill-Gap-Analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles with CSS variables
│   ├── layout.tsx       # Root layout with theme provider
│   └── page.tsx         # Main application page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── analysis-report.tsx
│   ├── file-uploader.tsx
│   ├── job-description-input.tsx
│   ├── score-card.tsx
│   ├── skills-list.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/               # Custom React hooks
└── lib/
    ├── file-validation.ts   # File type/size validation
    ├── gemini-service.ts    # Google Gemini AI integration
    ├── ocr-service.ts       # OCR text extraction
    ├── report-service.ts    # PDF report generation
    ├── types.ts             # TypeScript interfaces
    └── utils.ts             # Utility functions
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Google Gemini API
- **OCR**: Tesseract.js + PDF.js
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## Deployment

### Production URL

The application is deployed at: **https://ai-resume-skill-gap-analyzer.vercel.app**

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the following environment variables in Vercel dashboard (Settings > Environment Variables):
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `NEXT_PUBLIC_APP_URL` - `https://ai-resume-skill-gap-analyzer.vercel.app`
   - `NEXT_PUBLIC_FRONTEND_URL` - `https://ai-resume-skill-gap-analyzer.vercel.app`
4. Deploy - Vercel will auto-deploy on every push to main

## Analysis Features

### Resume Sections Analyzed

- Contact Information
- Professional Summary
- Work Experience
- Education
- Skills

### Scores Provided

- **Overall Score** (0-100): Overall resume quality
- **ATS Score** (0-100): Applicant Tracking System compatibility
- **Job Match Score** (0-100): Match percentage with job description (when provided)

### Improvement Categories

- Content improvements
- Format suggestions
- Keyword optimization
- Structure recommendations

## Privacy

- Your resume data is processed in real-time and not stored on any server
- Text extraction happens client-side using Tesseract.js
- Only extracted text is sent to Google Gemini API for analysis

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Google Gemini](https://ai.google.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
# ai-resume-skill-gap-analyzer
