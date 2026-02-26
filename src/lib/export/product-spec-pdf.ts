'use client';

import type jsPDF from 'jspdf';
import { LeashBuddyProductSpec } from '@/types/product-types';

// ============================================================================
// Page constants (A4 in mm)
// ============================================================================
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 20;
const MR = 20;
const MT = 18;
const MB = 20;
const CW = PAGE_W - ML - MR;
const CONTENT_BOTTOM = PAGE_H - MB;

// Colors
const AMBER = '#D97706';
const AMBER_DARK = '#92400E';
const TEXT_DARK = '#1C1917';
const TEXT_MED = '#44403C';
const TEXT_LIGHT = '#78716C';
const BORDER_LIGHT = '#D6D3D1';

/**
 * Ensure we're within page bounds, add new page if needed
 */
function checkPage(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > CONTENT_BOTTOM) {
    doc.addPage();
    return MT + 10;
  }
  return y;
}

/**
 * Draw a section heading
 */
function drawSectionHeading(doc: jsPDF, title: string, y: number): number {
  y = checkPage(doc, y, 14);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(AMBER_DARK);
  doc.text(title, ML, y);
  y += 2;
  doc.setDrawColor(AMBER);
  doc.setLineWidth(0.5);
  doc.line(ML, y, ML + CW, y);
  return y + 6;
}

/**
 * Draw a color swatch (small rectangle)
 */
function drawSwatch(doc: jsPDF, hex: string, x: number, y: number, size: number = 4) {
  // Parse hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  doc.setFillColor(r, g, b);
  doc.setDrawColor(BORDER_LIGHT);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y - size + 1, size, size, 0.5, 0.5, 'FD');
}

/**
 * Generate a manufacturing tech spec PDF for a LeashBuddy product
 */
export async function generateProductSpecPDF(spec: LeashBuddyProductSpec): Promise<void> {
  // Dynamic import — jsPDF is large, only load when exporting
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = MT;

  // ─── TITLE PAGE ──────────────────────────────────────────────────
  y = 60;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(AMBER_DARK);
  doc.text('LeashBuddy', PAGE_W / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(TEXT_MED);
  doc.text('Manufacturing Tech Spec', PAGE_W / 2, y, { align: 'center' });
  y += 16;
  doc.setFontSize(20);
  doc.setTextColor(TEXT_DARK);
  doc.text(spec.productName, PAGE_W / 2, y, { align: 'center' });
  y += 12;

  // Product summary
  doc.setFontSize(10);
  doc.setTextColor(TEXT_LIGHT);
  const summaryLines = [
    `Breed: ${spec.breedName}  |  Size: ${spec.productSize.toUpperCase()}  |  Ears: ${spec.earStyle}`,
    `Dimensions: ${spec.dimensions.heightCm} × ${spec.dimensions.widthCm} × ${spec.dimensions.depthCm} cm`,
    `Face Area: ${spec.dimensions.faceWidthCm} × ${spec.dimensions.faceHeightCm} cm`,
    `Spec Version: ${spec.specVersion}  |  Generated: ${new Date(spec.generatedAt).toLocaleDateString()}`,
  ];
  for (const line of summaryLines) {
    doc.text(line, PAGE_W / 2, y, { align: 'center' });
    y += 5;
  }

  // ─── PAGE 2: FABRIC COLORS ──────────────────────────────────────
  doc.addPage();
  y = MT;
  y = drawSectionHeading(doc, 'Fabric Colors & Materials', y);

  for (const fabric of spec.fabricColors) {
    y = checkPage(doc, y, 8);
    drawSwatch(doc, fabric.hex, ML, y, 4);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(TEXT_DARK);
    doc.text(fabric.partLabel, ML + 7, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_MED);
    doc.text(`${fabric.colorName}  |  ${fabric.material}  |  ${fabric.hex}`, ML + 55, y);
    if (fabric.notes) {
      y += 4;
      doc.setFontSize(8);
      doc.setTextColor(TEXT_LIGHT);
      doc.text(fabric.notes, ML + 7, y);
    }
    y += 6;
  }

  // ─── EMBROIDERY SPECS ─────────────────────────────────────────
  y += 4;
  y = drawSectionHeading(doc, 'Embroidery Specifications', y);

  for (const emb of spec.embroiderySpecs) {
    y = checkPage(doc, y, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(AMBER_DARK);
    doc.text(emb.location.replace(/-/g, ' ').toUpperCase(), ML, y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_LIGHT);
    doc.text(`${emb.dimensions.widthMm}×${emb.dimensions.heightMm}mm  |  ~${emb.estimatedStitchCount.toLocaleString()} stitches`, ML + CW, y, { align: 'right' });
    y += 5;

    doc.setFontSize(9);
    doc.setTextColor(TEXT_DARK);
    const descLines = doc.splitTextToSize(emb.designDescription, CW - 5);
    doc.text(descLines, ML + 2, y);
    y += descLines.length * 4 + 2;

    // Thread colors
    let threadX = ML + 2;
    for (const thread of emb.threadColors) {
      drawSwatch(doc, thread.hex, threadX, y, 3);
      threadX += 5;
      doc.setFontSize(8);
      doc.setTextColor(TEXT_MED);
      const label = `${thread.name} (${thread.usage})`;
      doc.text(label, threadX, y);
      threadX += doc.getTextWidth(label) + 6;
      if (threadX > ML + CW - 20) {
        threadX = ML + 2;
        y += 5;
      }
    }
    y += 8;

    if (emb.notes) {
      doc.setFontSize(8);
      doc.setTextColor(TEXT_LIGHT);
      doc.text(`Note: ${emb.notes}`, ML + 2, y);
      y += 5;
    }
  }

  // ─── BILL OF MATERIALS ────────────────────────────────────────
  doc.addPage();
  y = MT;
  y = drawSectionHeading(doc, 'Bill of Materials (BOM)', y);

  // Total cost
  const totalCost = spec.manufacturingBOM.reduce(
    (sum, item) => sum + (item.estimatedCostUSD || 0) * item.quantity,
    0
  );
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#047857');
  doc.text(`Estimated Total: $${totalCost.toFixed(2)}`, ML + CW, y, { align: 'right' });
  y += 8;

  // Table header
  y = checkPage(doc, y, 10);
  doc.setFillColor(255, 251, 235); // amber-50
  doc.rect(ML, y - 4, CW, 6, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(AMBER_DARK);
  doc.text('Item', ML + 2, y);
  doc.text('Qty', ML + 90, y);
  doc.text('Unit', ML + 105, y);
  doc.text('Spec', ML + 120, y);
  doc.text('Cost', ML + CW - 2, y, { align: 'right' });
  y += 5;

  // Rows
  let currentCategory = '';
  for (const item of spec.manufacturingBOM) {
    y = checkPage(doc, y, 10);

    if (item.category !== currentCategory) {
      currentCategory = item.category;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(AMBER);
      doc.text(currentCategory.toUpperCase(), ML + 2, y);
      y += 4;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_DARK);

    // Item name (truncate if too long)
    const name = item.name.length > 40 ? item.name.slice(0, 37) + '...' : item.name;
    doc.text(name, ML + 2, y);
    doc.text(String(item.quantity), ML + 90, y);
    doc.text(item.unit, ML + 105, y);
    const specText = (item.specification || '').slice(0, 25);
    doc.setTextColor(TEXT_LIGHT);
    doc.text(specText, ML + 120, y);
    if (item.estimatedCostUSD !== undefined) {
      doc.setTextColor(TEXT_MED);
      doc.text(`$${(item.estimatedCostUSD * item.quantity).toFixed(2)}`, ML + CW - 2, y, { align: 'right' });
    }

    // Separator
    doc.setDrawColor(BORDER_LIGHT);
    doc.setLineWidth(0.1);
    y += 1.5;
    doc.line(ML, y, ML + CW, y);
    y += 3.5;
  }

  // ─── ASSEMBLY INSTRUCTIONS ────────────────────────────────────
  y += 6;
  y = drawSectionHeading(doc, 'Assembly Instructions', y);

  for (const note of spec.assemblyNotes) {
    y = checkPage(doc, y, 8);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_DARK);
    const noteLines = doc.splitTextToSize(note, CW - 5);
    doc.text(noteLines, ML + 2, y);
    y += noteLines.length * 4 + 2;
  }

  // ─── FOOTER ON ALL PAGES ──────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(TEXT_LIGHT);
    doc.text(
      `LeashBuddy Tech Spec  |  ${spec.productName}  |  Page ${i} of ${totalPages}`,
      PAGE_W / 2,
      PAGE_H - 10,
      { align: 'center' }
    );
  }

  // ─── SAVE ────────────────────────────────────────────────────
  const filename = `${spec.productName.replace(/[^a-zA-Z0-9]/g, '_')}_TechSpec.pdf`;
  doc.save(filename);
}
