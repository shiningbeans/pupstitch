'use client';

import type jsPDF from 'jspdf';
import { CustomPattern, PatternSection } from '@/types';
import { getAbbreviations } from '@/lib/patterns/formatter';

// ============================================================================
// Page constants (A4 in mm)
// ============================================================================
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 25; // margin left
const MR = 25; // margin right
const MT = 18; // margin top
const MB = 20; // margin bottom
const CW = PAGE_W - ML - MR; // content width
const HEADER_H = 14;
const CONTENT_TOP = MT + HEADER_H;
const CONTENT_BOTTOM = PAGE_H - MB;

// Colors
const AMBER = '#D97706';
const AMBER_DARK = '#92400E';
const AMBER_DEEP = '#78350F';
const AMBER_LIGHT_BG = '#FFFBEB';
const TEXT_DARK = '#1C1917';
const TEXT_MED = '#44403C';
const TEXT_LIGHT = '#78716C';
const TEXT_FAINT = '#A8A29E';
const BORDER_LIGHT = '#D6D3D1';

// ============================================================================
// Helpers
// ============================================================================

function hex(doc: jsPDF, color: string, method: 'text' | 'draw' | 'fill') {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  if (method === 'text') doc.setTextColor(r, g, b);
  else if (method === 'draw') doc.setDrawColor(r, g, b);
  else doc.setFillColor(r, g, b);
}

interface State {
  doc: jsPDF;
  y: number;
  page: number;
  title: string;
}

function addHeader(s: State) {
  const { doc, title } = s;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  hex(doc, AMBER, 'text');
  doc.text(title, PAGE_W - MR, MT, { align: 'right' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_FAINT, 'text');
  doc.text('PupStitch', PAGE_W - MR, MT + 4.5, { align: 'right' });
}

function addFooter(s: State) {
  const { doc, page } = s;
  const fy = PAGE_H - 10;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_FAINT, 'text');
  doc.text('PupStitch.com', ML, fy);
  doc.text('Custom Amigurumi Patterns', PAGE_W / 2, fy, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(String(page), PAGE_W - MR, fy, { align: 'right' });
}

function newPage(s: State): State {
  addFooter(s);
  s.doc.addPage();
  s.page++;
  s.y = CONTENT_TOP;
  addHeader(s);
  return s;
}

function ensureSpace(s: State, h: number): State {
  if (s.y + h > CONTENT_BOTTOM) return newPage(s);
  return s;
}

/**
 * Strip "Rnd N:", "Row N:", "R N:" prefix from instruction text
 * since we display the row number separately.
 */
function stripRowPrefix(text: string): string {
  return text.replace(/^(Rnd|Round|Row|R)\s*\d+[\s:.\-–]*\s*/i, '').trim();
}

/**
 * Draw a numbered section header like "3. Head"
 */
function sectionHeader(s: State, num: number, name: string) {
  const { doc } = s;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  hex(doc, TEXT_DARK, 'text');
  const numStr = `${num}.`;
  doc.text(numStr, ML, s.y);
  const numWidth = doc.getTextWidth(numStr);
  doc.setFontSize(20);
  doc.text(name, ML + numWidth + 4, s.y);
}

// ============================================================================
// Cover Page
// ============================================================================

function coverPage(s: State, p: CustomPattern) {
  const { doc } = s;
  const cx = PAGE_W / 2;

  // Top amber bar
  hex(doc, AMBER, 'fill');
  doc.rect(0, 0, PAGE_W, 8, 'F');

  // Title
  doc.setFontSize(34);
  doc.setFont('helvetica', 'bold');
  hex(doc, AMBER_DEEP, 'text');
  const titleText = p.generatedPattern?.title || p.name || 'Amigurumi Pattern';
  const titleLines = doc.splitTextToSize(titleText, CW);
  let ty = 70;
  for (const line of titleLines) {
    doc.text(line, cx, ty, { align: 'center' });
    ty += 14;
  }

  // Decorative divider
  hex(doc, AMBER, 'draw');
  doc.setLineWidth(1);
  doc.line(cx - 30, ty + 2, cx + 30, ty + 2);
  ty += 14;

  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_MED, 'text');
  doc.text('Custom Amigurumi Crochet Pattern', cx, ty, { align: 'center' });
  ty += 20;

  // Dog name if available
  if (p.dogName) {
    ty += 4;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'italic');
    hex(doc, AMBER, 'text');
    doc.text(`For ${p.dogName}`, cx, ty, { align: 'center' });
    ty += 10;
  }

  // Info block
  doc.setFontSize(11);
  const info = [
    `Breed: ${formatBreedName(p.breedId || 'custom')}`,
    `Skill Level: ${capitalize(p.generatedPattern?.skillLevel || 'intermediate')}`,
    `Estimated Time: ~${Math.round(p.generatedPattern?.estimatedTotalTime || 4)} hours`,
    `Hook Size: ${p.materials?.hookSize || '5mm'}`,
    `Yarn Weight: ${capitalize(p.materials?.yarns?.[0]?.weight || 'worsted')}`,
  ];
  for (const line of info) {
    hex(doc, TEXT_MED, 'text');
    doc.text(line, cx, ty, { align: 'center' });
    ty += 8;
  }
  ty += 8;

  // Yarn color swatches
  const yarns = p.materials.yarns;
  if (yarns.length > 0) {
    doc.setFontSize(9);
    hex(doc, TEXT_LIGHT, 'text');
    doc.text('Yarn Colors', cx, ty, { align: 'center' });
    ty += 7;

    const sw = 14;
    const gap = 5;
    const totalW = yarns.length * sw + (yarns.length - 1) * gap;
    let sx = cx - totalW / 2;

    for (const yarn of yarns) {
      hex(doc, yarn.hexCode, 'fill');
      hex(doc, BORDER_LIGHT, 'draw');
      doc.setLineWidth(0.3);
      doc.roundedRect(sx, ty, sw, sw, 2, 2, 'FD');
      // Yarn name below swatch
      doc.setFontSize(6);
      hex(doc, TEXT_LIGHT, 'text');
      doc.text(yarn.name, sx + sw / 2, ty + sw + 4, { align: 'center', maxWidth: sw + gap });
      sx += sw + gap;
    }
    ty += sw + 12;
  }

  // Footer info
  doc.setFontSize(9);
  hex(doc, TEXT_FAINT, 'text');
  doc.text(`Generated by PupStitch — ${new Date().toLocaleDateString()}`, cx, 255, { align: 'center' });
  doc.text(p.dogName ? `Custom amigurumi pattern for ${p.dogName}` : 'Custom amigurumi pattern for your pup', cx, 262, { align: 'center' });

  // Bottom amber bar
  hex(doc, AMBER, 'fill');
  doc.rect(0, PAGE_H - 8, PAGE_W, 8, 'F');
}

// ============================================================================
// Preview Image Page (AI-generated amigurumi preview)
// ============================================================================

function previewImagePage(s: State, p: CustomPattern): State {
  if (!p.previewImageUrl) return s;

  s = newPage(s);
  const { doc } = s;
  const cx = PAGE_W / 2;

  // Title
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  hex(doc, AMBER_DEEP, 'text');
  doc.text('Amigurumi Preview', cx, s.y, { align: 'center' });
  s.y += 6;

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_LIGHT, 'text');
  doc.text('AI-generated reference — your finished doll should look like this!', cx, s.y, { align: 'center' });
  s.y += 10;

  // Try to embed the image
  try {
    const imgData = p.previewImageUrl;
    // Determine format from data URL
    let format: string = 'PNG';
    if (imgData.includes('image/jpeg') || imgData.includes('image/jpg')) {
      format = 'JPEG';
    } else if (imgData.includes('image/png')) {
      format = 'PNG';
    } else if (imgData.includes('image/webp')) {
      format = 'PNG'; // jsPDF may not support webp, treat as PNG
    }

    // Center the image — max width 120mm, max height 150mm
    const maxW = 120;
    const maxH = 150;

    doc.addImage(imgData, format, cx - maxW / 2, s.y, maxW, maxH, undefined, 'FAST');
    s.y += maxH + 8;
  } catch (e) {
    // If image embedding fails, show placeholder text
    console.warn('Could not embed preview image in PDF:', e);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_LIGHT, 'text');
    doc.text('(Preview image could not be embedded)', cx, s.y + 40, { align: 'center' });
    s.y += 50;
  }

  // Body part analysis summary (if available)
  const bpa = p.analysisResult?.bodyPartAnalysis;
  if (bpa && bpa.length > 0) {
    s = ensureSpace(s, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    hex(doc, AMBER_DARK, 'text');
    doc.text('Color & Feature Reference', cx, s.y, { align: 'center' });
    s.y += 8;

    for (const bp of bpa) {
      s = ensureSpace(s, 14);
      // Color swatch
      try {
        hex(doc, bp.primaryColor, 'fill');
        hex(doc, BORDER_LIGHT, 'draw');
        doc.setLineWidth(0.2);
        doc.roundedRect(ML + 2, s.y - 3, 4, 4, 0.5, 0.5, 'FD');
      } catch {
        // skip swatch if color is invalid
      }

      // Part name
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      hex(doc, TEXT_DARK, 'text');
      doc.text(capitalize(bp.partName), ML + 10, s.y);

      // Shape info
      doc.setFont('helvetica', 'normal');
      hex(doc, TEXT_MED, 'text');
      const info = [bp.shape, bp.texture].filter(Boolean).join(', ');
      if (info) {
        doc.text(` — ${info}`, ML + 10 + doc.getTextWidth(capitalize(bp.partName)), s.y);
      }
      s.y += 5;

      // Markings
      if (bp.markings && bp.markings.length > 0) {
        doc.setFontSize(8);
        hex(doc, TEXT_LIGHT, 'text');
        const markingText = `Markings: ${bp.markings.join(', ')}`;
        const markLines = doc.splitTextToSize(markingText, CW - 15);
        for (const ml of markLines) {
          s = ensureSpace(s, 5);
          doc.text(ml, ML + 10, s.y);
          s.y += 4;
        }
      }
      s.y += 2;
    }
  }

  return s;
}

// ============================================================================
// Materials Page
// ============================================================================

function materialsPage(s: State, p: CustomPattern): State {
  s = newPage(s);
  const { doc } = s;
  const mat = p.materials;

  sectionHeader(s, 1, 'Instruments and Materials');
  s.y += 14;

  const bulletX = ML + 8;

  // Hook
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_DARK, 'text');
  doc.text(`•  Crochet hook: ${mat.hookSize}`, bulletX, s.y);
  s.y += 8;

  // Yarns with color swatches
  for (const yarn of mat.yarns) {
    s = ensureSpace(s, 10);
    hex(doc, yarn.hexCode, 'fill');
    hex(doc, BORDER_LIGHT, 'draw');
    doc.setLineWidth(0.2);
    doc.roundedRect(bulletX, s.y - 3, 4, 4, 0.5, 0.5, 'FD');

    hex(doc, TEXT_DARK, 'text');
    doc.setFont('helvetica', 'normal');
    doc.text(`${yarn.name} — ${yarn.yardage} yards`, bulletX + 7, s.y);
    s.y += 7;
  }

  s.y += 2;

  // Sewing needle + notions
  for (const notion of mat.notions) {
    s = ensureSpace(s, 8);
    hex(doc, TEXT_DARK, 'text');
    doc.text(`•  ${notion.name} (${notion.quantity} ${notion.unit})`, bulletX, s.y);
    s.y += 7;
  }

  // Stuffing
  s = ensureSpace(s, 8);
  doc.text(`•  ${mat.stuffingType || 'Polyester fiberfill'}: ~${mat.stuffingAmount} oz`, bulletX, s.y);
  s.y += 7;

  // Additional supplies
  if (mat.additionalSupplies && mat.additionalSupplies.length > 0) {
    for (const supply of mat.additionalSupplies) {
      s = ensureSpace(s, 8);
      doc.text(`•  ${supply}`, bulletX, s.y);
      s.y += 7;
    }
  }

  // Separator + total
  s.y += 4;
  hex(doc, TEXT_FAINT, 'draw');
  doc.setLineWidth(0.3);
  doc.line(ML, s.y, ML + CW, s.y);
  s.y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  hex(doc, AMBER_DARK, 'text');
  doc.text(`Total Yardage Needed: ${mat.totalYardageNeeded} yards`, bulletX, s.y);
  s.y += 12;

  // Yarn info blurb
  s.y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  hex(doc, TEXT_MED, 'text');
  const blurb = `This pattern uses ${mat.yarns?.[0]?.weight || 'worsted'} weight yarn. To create a toy matching the intended size, use the recommended hook size (${mat.hookSize || '5mm'}) and crochet with tight stitches. The stuffing material used is ${(mat.stuffingType || 'polyester fiberfill').toLowerCase()}.`;
  const blurbLines = doc.splitTextToSize(blurb, CW - 10);
  for (const line of blurbLines) {
    s = ensureSpace(s, 6);
    doc.text(line, ML + 5, s.y);
    s.y += 5;
  }

  return s;
}

// ============================================================================
// Abbreviations
// ============================================================================

function abbreviationsSection(s: State): State {
  s = newPage(s);
  const { doc } = s;

  sectionHeader(s, 2, 'Abbreviations');
  s.y += 14;

  const abbrevs = getAbbreviations();
  const entries = Object.entries(abbrevs);

  // Render as aligned table: bold abbreviation, then definition
  const abbrColW = 22; // width for abbreviation column

  for (const [abbr, full] of entries) {
    s = ensureSpace(s, 7);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    hex(doc, AMBER_DARK, 'text');
    doc.text(abbr, ML + abbrColW, s.y, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_MED, 'text');
    doc.text(full, ML + abbrColW + 4, s.y);
    s.y += 6;
  }

  // Tip boxes
  s.y += 8;
  s = ensureSpace(s, 50);

  // Tip 1
  s = drawTipBox(s, 'Tip 1',
    'The toy must be crocheted with tight stitches, to be sure that there won\'t be any holes through which stuffing material can be seen.');
  s.y += 6;

  // Tip 2
  s = drawTipBox(s, 'Tip 2',
    'To keep track of the beginning of the row, use a marker. Pin marker to the last loop of the row. Every new row must be finished with a loop at the marker.');

  return s;
}

function drawTipBox(s: State, title: string, text: string): State {
  const { doc } = s;

  // Calculate box height
  doc.setFontSize(9);
  const textLines = doc.splitTextToSize(text, CW - 20);
  const boxH = 10 + textLines.length * 4.5 + 4;

  s = ensureSpace(s, boxH + 4);

  hex(doc, AMBER_LIGHT_BG, 'fill');
  hex(doc, AMBER, 'draw');
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, s.y, CW, boxH, 3, 3, 'FD');

  s.y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  hex(doc, AMBER, 'text');
  doc.text(title, ML + 8, s.y);
  s.y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_MED, 'text');
  for (const line of textLines) {
    doc.text(line, ML + 8, s.y);
    s.y += 4.5;
  }

  s.y += 2;
  return s;
}

// ============================================================================
// Pattern Body Part Sections
// ============================================================================

function patternSection(
  s: State,
  section: PatternSection,
  num: number,
  hookSize: string,
  primaryYarnName: string,
  bodyPartNotes?: { crochetNotes?: string; shape?: string; markings?: string[]; primaryColor?: string }
): State {
  // Start each body part section on a new page
  s = newPage(s);
  const { doc } = s;

  // Section header: "3. Head"
  sectionHeader(s, num, section.name);
  s.y += 10;

  // AI crochet notes box (if body part analysis available)
  if (bodyPartNotes?.crochetNotes) {
    const noteText = bodyPartNotes.crochetNotes;
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(noteText, CW - 24);
    const boxH = 10 + noteLines.length * 4.5 + 4;

    s = ensureSpace(s, boxH + 4);

    // Color swatch accent bar on left
    try {
      if (bodyPartNotes.primaryColor) {
        hex(doc, bodyPartNotes.primaryColor, 'fill');
        doc.rect(ML, s.y, 3, boxH, 'F');
      }
    } catch {
      // skip if color invalid
    }

    hex(doc, AMBER_LIGHT_BG, 'fill');
    hex(doc, AMBER, 'draw');
    doc.setLineWidth(0.3);
    doc.roundedRect(ML + 4, s.y, CW - 4, boxH, 2, 2, 'FD');

    s.y += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    hex(doc, AMBER, 'text');
    doc.text('AI CROCHET NOTES', ML + 10, s.y);
    s.y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_MED, 'text');
    for (const line of noteLines) {
      doc.text(line, ML + 10, s.y);
      s.y += 4.5;
    }

    // Markings note
    if (bodyPartNotes.markings && bodyPartNotes.markings.length > 0) {
      s.y += 1;
      doc.setFontSize(8);
      hex(doc, TEXT_LIGHT, 'text');
      const markText = `Markings: ${bodyPartNotes.markings.join(', ')}`;
      const markLines = doc.splitTextToSize(markText, CW - 28);
      for (const ml of markLines) {
        doc.text(ml, ML + 10, s.y);
        s.y += 4;
      }
    }

    s.y += 6;
  }

  // "With [color] yarn, [hook] hook" subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  hex(doc, TEXT_MED, 'text');
  doc.text(`With ${primaryYarnName.toLowerCase()} yarn, ${hookSize}`, ML + 5, s.y);
  s.y += 10;

  // Row-by-row instructions
  const ROW_LABEL_RIGHT = ML + 28; // right edge for row labels
  const INSTR_LEFT = ML + 31;      // left edge for instruction text
  const INSTR_MAX_W = CW - 35;     // max width for instruction text

  for (const inst of section.instructions) {
    const rawText = stripRowPrefix(inst.instruction);

    doc.setFontSize(9.5);
    const instrLines = doc.splitTextToSize(rawText, INSTR_MAX_W);
    const lineH = 5;
    const needed = instrLines.length * lineH + 3;

    s = ensureSpace(s, needed);

    // Row number label (bold, right-aligned)
    doc.setFont('helvetica', 'bold');
    hex(doc, TEXT_DARK, 'text');
    doc.setFontSize(9.5);
    const rowLabel = `${inst.rowNumber} row`;
    doc.text(rowLabel, ROW_LABEL_RIGHT, s.y, { align: 'right' });

    // Instruction text (normal)
    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_DARK, 'text');
    for (let i = 0; i < instrLines.length; i++) {
      doc.text(instrLines[i], INSTR_LEFT, s.y + i * lineH);
    }

    s.y += instrLines.length * lineH + 1.5;
  }

  // Section finishing notes
  if (section.notes) {
    s.y += 5;
    s = ensureSpace(s, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_MED, 'text');
    const noteLines = doc.splitTextToSize(section.notes, CW - 10);
    for (const line of noteLines) {
      s = ensureSpace(s, 6);
      doc.text(line, ML + 5, s.y);
      s.y += 5;
    }
  }

  // Difficulty notes
  if (section.difficultyNotes) {
    s.y += 3;
    s = ensureSpace(s, 12);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_LIGHT, 'text');
    doc.text(section.difficultyNotes, ML + 5, s.y);
    s.y += 6;
  }

  return s;
}

// ============================================================================
// Assembly Instructions
// ============================================================================

function assemblyPage(s: State, instructions: string[], num: number): State {
  s = newPage(s);
  const { doc } = s;

  sectionHeader(s, num, 'Assembly');
  s.y += 14;

  for (let i = 0; i < instructions.length; i++) {
    const step = instructions[i].replace(/^\d+\.\s*/, '');

    doc.setFontSize(10);
    const lines = doc.splitTextToSize(step, CW - 20);
    const needed = lines.length * 5.5 + 4;

    s = ensureSpace(s, needed);

    // Step number (amber circle)
    hex(doc, AMBER, 'fill');
    doc.circle(ML + 6, s.y - 1.5, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    hex(doc, '#FFFFFF', 'text');
    doc.text(String(i + 1), ML + 6, s.y - 0.5, { align: 'center' });

    // Step text
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    hex(doc, TEXT_DARK, 'text');
    for (let j = 0; j < lines.length; j++) {
      doc.text(lines[j], ML + 14, s.y + j * 5.5);
    }

    s.y += lines.length * 5.5 + 4;
  }

  return s;
}

// ============================================================================
// Notes Page
// ============================================================================

function notesSection(s: State, notes: string, num: number): State {
  s.y += 10;
  s = ensureSpace(s, 50);
  const { doc } = s;

  sectionHeader(s, num, 'Notes');
  s.y += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  hex(doc, TEXT_MED, 'text');
  const lines = doc.splitTextToSize(notes, CW - 10);
  for (const line of lines) {
    s = ensureSpace(s, 7);
    doc.text(line, ML + 5, s.y);
    s.y += 5.5;
  }

  return s;
}

// ============================================================================
// Utilities
// ============================================================================

function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatBreedName(breedId: string): string {
  return breedId
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ============================================================================
// Main Export Function
// ============================================================================

export async function generatePatternPDF(pattern: CustomPattern): Promise<void> {
  // Dynamic import to avoid SSR issues — jsPDF needs browser APIs
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

  if (!jsPDF) {
    throw new Error('Could not load jsPDF library');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const gen = pattern.generatedPattern;
  const mat = pattern.materials;

  if (!gen || !mat) {
    throw new Error('Pattern is missing generated pattern or materials data');
  }

  const s: State = {
    doc,
    y: CONTENT_TOP,
    page: 1,
    title: gen.title || pattern.name || 'Amigurumi Pattern',
  };

  // ── Page 1: Cover ──
  coverPage(s, pattern);
  addFooter(s);

  // ── Preview Image Page (if available) ──
  let state = previewImagePage(s, pattern);

  // ── Materials Page ──
  state = materialsPage(state, pattern);

  // ── Abbreviations ──
  state = abbreviationsSection(state);

  // ── Build a lookup for body part analysis by name ──
  const bpaLookup: Record<string, { crochetNotes?: string; shape?: string; markings?: string[]; primaryColor?: string }> = {};
  const bpa = pattern.analysisResult?.bodyPartAnalysis;
  if (bpa) {
    for (const bp of bpa) {
      const key = bp.partName.toLowerCase().trim();
      bpaLookup[key] = {
        crochetNotes: bp.crochetNotes,
        shape: bp.shape,
        markings: bp.markings,
        primaryColor: bp.primaryColor,
      };
    }
  }

  // ── Body Part Sections ──
  let secNum = 3;
  const sections = gen.sections || [];
  for (const section of sections) {
    // Try to match section to body part analysis
    const sectionKey = section.name.toLowerCase().trim();
    const bpNotes = bpaLookup[sectionKey]
      || bpaLookup[sectionKey.replace(/\s*\(.*\)/, '')] // strip parenthetical e.g. "Ears (make 2)"
      || bpaLookup[sectionKey.split(' ')[0]] // first word match e.g. "Front Legs" → "front"
      || undefined;

    state = patternSection(
      state,
      section,
      secNum,
      mat.hookSize || '5mm',
      mat.yarns?.[0]?.name || 'Main color',
      bpNotes
    );
    secNum++;
  }

  // ── Assembly ──
  const assembly = gen.assemblyInstructions || [];
  if (assembly.length > 0) {
    state = assemblyPage(state, assembly, secNum);
    secNum++;
  }

  // ── Notes ──
  if (gen.notes) {
    state = notesSection(state, gen.notes, secNum);
  }

  // Final page footer
  addFooter(state);

  // Trigger download
  const dogNamePart = pattern.dogName ? `${pattern.dogName}_` : '';
  const safeName = (dogNamePart + (pattern.breedId || pattern.name || 'pattern')).replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeName}_pattern.pdf`;
  doc.save(fileName);
}
