'use client';

import { jsPDF } from 'jspdf';
import { ResumeAnalysis } from './types';

/**
 * Generate a PDF report from the analysis results
 */
export async function generatePDFReport(analysis: ResumeAnalysis): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add text with wrapping
  const addText = (text: string, x: number, fontSize: number = 12, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);

    // Check if we need a new page
    if (yPos + lines.length * (fontSize * 0.4) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = 20;
    }

    doc.text(lines, x, yPos);
    yPos += lines.length * (fontSize * 0.4) + 5;
  };

  // Title
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Resume Analysis Report', margin, 28);

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date(analysis.analyzedAt).toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  // Scores Section
  addText('SCORES OVERVIEW', margin, 16, true);
  yPos += 5;

  // Draw score boxes
  const scoreBoxWidth = (pageWidth - margin * 2 - 20) / 3;
  const scores = [
    { label: 'Overall Score', value: analysis.overallScore },
    { label: 'ATS Score', value: analysis.atsScore },
    ...(analysis.jobMatchScore !== undefined
      ? [{ label: 'Job Match', value: analysis.jobMatchScore }]
      : []),
  ];

  scores.forEach((score, index) => {
    const x = margin + index * (scoreBoxWidth + 10);

    // Score box background
    const color = score.value >= 70 ? [34, 197, 94] : score.value >= 50 ? [234, 179, 8] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, yPos, scoreBoxWidth, 30, 3, 3, 'F');

    // Score text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score.value}`, x + scoreBoxWidth / 2, yPos + 15, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(score.label, x + scoreBoxWidth / 2, yPos + 24, { align: 'center' });
  });

  doc.setTextColor(0, 0, 0);
  yPos += 45;

  // Section Analysis
  addText('SECTION ANALYSIS', margin, 16, true);
  yPos += 5;

  const sections = [
    { name: 'Contact Information', data: analysis.sections.contact },
    { name: 'Professional Summary', data: analysis.sections.summary },
    { name: 'Work Experience', data: analysis.sections.experience },
    { name: 'Education', data: analysis.sections.education },
    { name: 'Skills', data: analysis.sections.skills },
  ];

  sections.forEach((section) => {
    // Check for new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const statusIcon = section.data.present ? '✓' : '✗';
    doc.text(`${statusIcon} ${section.name} (${section.data.score}/100)`, margin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const feedbackLines = doc.splitTextToSize(section.data.feedback, pageWidth - margin * 2);
    doc.text(feedbackLines, margin, yPos);
    yPos += feedbackLines.length * 4 + 8;
  });

  // Skills
  addText('IDENTIFIED SKILLS', margin, 16, true);
  yPos += 5;

  if (analysis.skills.identified.length > 0) {
    const skillsText = analysis.skills.identified.join(', ');
    addText(skillsText, margin, 10);
  } else {
    addText('No skills identified in the resume.', margin, 10);
  }

  // Missing Skills (if job description provided)
  if (analysis.skills.missing && analysis.skills.missing.length > 0) {
    yPos += 5;
    addText('MISSING SKILLS (from job description)', margin, 16, true);
    yPos += 5;
    const missingText = analysis.skills.missing.join(', ');
    addText(missingText, margin, 10);
  }

  // Improvement Suggestions
  yPos += 10;
  addText('IMPROVEMENT SUGGESTIONS', margin, 16, true);
  yPos += 5;

  analysis.improvements.forEach((imp, index) => {
    if (yPos > doc.internal.pageSize.getHeight() - 50) {
      doc.addPage();
      yPos = 20;
    }

    const priorityColors: Record<string, number[]> = {
      high: [239, 68, 68],
      medium: [234, 179, 8],
      low: [34, 197, 94],
    };

    doc.setFillColor(...(priorityColors[imp.priority] as [number, number, number]));
    doc.circle(margin + 3, yPos - 2, 2, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${imp.title} [${imp.category.toUpperCase()}]`, margin + 10, yPos);
    yPos += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(imp.description, pageWidth - margin * 2 - 10);
    doc.text(descLines, margin + 10, yPos);
    yPos += descLines.length * 4 + 8;
  });

  // ATS Issues
  if (analysis.atsIssues.length > 0) {
    yPos += 10;
    addText('ATS COMPATIBILITY ISSUES', margin, 16, true);
    yPos += 5;

    analysis.atsIssues.forEach((issue, index) => {
      if (yPos > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${issue.issue}`, margin, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Impact: ${issue.impact.toUpperCase()}`, margin + 5, yPos);
      yPos += 5;

      const solutionLines = doc.splitTextToSize(`Solution: ${issue.solution}`, pageWidth - margin * 2 - 5);
      doc.text(solutionLines, margin + 5, yPos);
      yPos += solutionLines.length * 4 + 8;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | AI Resume Analyzer`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
}

/**
 * Download the PDF report
 */
export function downloadPDFReport(analysis: ResumeAnalysis, filename: string = 'resume-analysis.pdf') {
  generatePDFReport(analysis).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
