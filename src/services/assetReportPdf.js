import { jsPDF } from 'jspdf';
import companyLogoUrl from '../assets/AssetCues-Logo 1.png';
import { UPLOAD_PROCESSING_MODES } from '../constants/uploadMode';
import {
  formatConfidence,
  formatDateTime,
  formatList,
  formatInrMoneyRange,
} from '../utils/formatters';
import { buildAssetReportUrl } from '../utils/reportUrl';
import { formatPlacement, formatStickerType } from '../utils/placementFormatters';

const MARGIN = 12;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = PAGE_HEIGHT - 10;
const LABEL_COL = 36;
const MAX_VALUE_CHARS = 280;

function sanitizeFilename(name) {
  return (name || 'asset')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 48);
}

function truncateText(text, max = MAX_VALUE_CHARS) {
  const s = String(text ?? '');
  if (s.length <= max) return s;
  return `${s.slice(0, max).trimEnd()}…`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

async function urlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load resource');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Small JPEG for PDF (keeps file size down).
 */
async function prepareImageForPdf(src, maxWidthPx = 480, quality = 0.68) {
  const dataSrc =
    src.startsWith('data:') || src.startsWith('blob:') || src.startsWith('http')
      ? src
      : await urlToDataUrl(src);

  const img = await loadImage(dataSrc);
  const scale = Math.min(1, maxWidthPx / (img.naturalWidth || img.width || maxWidthPx));
  const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
  const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return {
    dataUrl: canvas.toDataURL('image/jpeg', quality),
    width,
    height,
  };
}

function collectReportImages(entry) {
  const isMulti =
    entry.analysis_method === 'multi_image' ||
    entry.processingMode === UPLOAD_PROCESSING_MODES.DIRECT;

  if (isMulti) {
    return (entry.previewUrls || []).map((url, index) => ({
      url,
      caption: `Image ${index + 1}`,
    }));
  }

  const items = [];
  if (entry.mergedImageUrl) {
    items.push({ url: entry.mergedImageUrl, caption: 'Collage (AI input)' });
  }
  const uploads = (entry.previewUrls || []).filter((u) => u && u !== entry.mergedImageUrl);
  uploads.forEach((url, index) => {
    items.push({ url, caption: `Upload ${index + 1}` });
  });
  return items;
}

function buildFieldSections(entry) {
  const asset = entry.asset || {};
  const condition = entry.conditionDetail || {};
  const valuation = entry.valuation || {};
  const identifiers = entry.identifiers || {};
  const sections = [
    {
      title: 'Summary',
      fields: [
        ['Asset', entry.asset_name],
        ['Condition', entry.condition],
        ['Tag number', entry.detected_tag_number_raw],
        ['Method', entry.analysis_method?.replace(/_/g, ' ')],
        ['Images', entry.images_analyzed != null ? String(entry.images_analyzed) : null],
      ],
    },
    {
      title: 'Identification',
      fields: [
        ['Tag position', entry.barcodeposition || identifiers.tag_position],
        ['Readability', entry.image_readability],
        ['Tag reasoning', entry.tag_detection_reasoning || identifiers.tag_detection_reasoning],
        ['Labels', formatList(entry.visible_labels)],
        ...(identifiers.barcode?.present
          ? [
              ['Barcode present', identifiers.barcode.present ? 'Yes' : 'No'],
              [
                'Barcode readable',
                identifiers.barcode.readable == null
                  ? null
                  : identifiers.barcode.readable
                    ? 'Yes'
                    : 'No',
              ],
              ['Barcode placement', formatPlacement(identifiers.barcode.placement)],
              ['Barcode reasoning', identifiers.barcode.detection_reasoning],
            ]
          : []),
      ],
    },
    {
      title: 'Asset details',
      fields: [
        ['Brand / model', [asset.brand, asset.model].filter(Boolean).join(' ') || null],
        ['Category', [asset.category, asset.type].filter(Boolean).join(' · ') || null],
        ['Color / material', [asset.color, asset.material].filter(Boolean).join(' · ') || null],
        ['Dimensions', asset.estimated_dimensions],
        ['Serial', asset.serial_number],
        ['Specs', formatList(asset.specifications)],
        ['Description', entry.asset_description || asset.description],
      ],
    },
    {
      title: 'Condition',
      fields: [
        ['Summary', condition.summary || entry.asset_condition],
        [
          'Score',
          condition.overall_score != null
            ? `${Math.round(
                condition.overall_score > 10
                  ? condition.overall_score
                  : condition.overall_score > 1
                    ? condition.overall_score * 10
                    : condition.overall_score * 100
              )}/100`
            : null,
        ],
        ['Cosmetic', condition.cosmetic_condition],
        ['Structural', condition.structural_condition],
        ['Functional', condition.functional_status],
        ['Repair', condition.repair_recommendation],
        ['Damage count', condition.damage_count != null ? String(condition.damage_count) : null],
      ],
    },
    {
      title: 'Valuation',
      fields: [
        ['Current Estimate Value (₹)', formatInrMoneyRange(valuation.as_is?.inr)],
        ['NBV (₹)', formatInrMoneyRange(valuation.nbv?.inr)],
        [
          'NBV exceeds current estimate',
          valuation.nbv_exceeds_as_is == null
            ? null
            : valuation.nbv_exceeds_as_is
              ? 'Yes'
              : 'No',
        ],
        ['NBV vs current estimate note', valuation.nbv_vs_as_is_note],
        ['Like-new reference (₹)', formatInrMoneyRange(valuation.like_new_reference?.inr)],
        ['Confidence', valuation.confidence != null ? formatConfidence(valuation.confidence) : null],
      ],
    },
  ];

  if (condition.damage_items?.length) {
    sections.push({
      title: 'Damage',
      fields: condition.damage_items.slice(0, 5).flatMap((item, i) => [
        [`#${i + 1}`, [item.type, item.severity, item.location].filter(Boolean).join(' · ')],
        [`#${i + 1} detail`, item.detail],
        [`#${i + 1} placement`, formatPlacement(item.placement)],
        [
          `#${i + 1} seen in`,
          item.seen_in_image != null ? `Image ${item.seen_in_image}` : null,
        ],
        [
          `#${i + 1} affects function`,
          item.affects_function == null ? null : item.affects_function ? 'Yes' : 'No',
        ],
      ]),
    });
  }

  if (identifiers.stickers?.length) {
    sections.push({
      title: 'Stickers',
      fields: identifiers.stickers.slice(0, 8).flatMap((sticker, i) => [
        [`#${i + 1}`, sticker.label_text],
        [`#${i + 1} type`, formatStickerType(sticker.sticker_type)],
        [`#${i + 1} placement`, formatPlacement(sticker.placement)],
      ]),
    });
  }

  return sections
    .map((section) => ({
      ...section,
      fields: section.fields
        .map(([label, value]) => [label, truncateText(value)])
        .filter(([, v]) => v != null && v !== '' && v !== '—'),
    }))
    .filter((s) => s.fields.length > 0);
}

function wrapText(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text), maxWidth);
}

function gridColumns(count) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Thumbnail grid on the current page (all images on one page when space allows).
 * @returns {number} y position after the grid
 */
async function drawImagesGrid(doc, imageItems, startY) {
  let y = startY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('Asset images', MARGIN, y);
  y += 5;

  const prepared = await Promise.all(
    imageItems.map(async (item) => {
      try {
        const img = await prepareImageForPdf(item.url, 420, 0.65);
        return { ...item, img };
      } catch {
        return { ...item, img: null };
      }
    }),
  );

  const valid = prepared.filter((p) => p.img);
  if (!valid.length) {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('No images could be embedded.', MARGIN, y + 4);
    return y + 8;
  }

  const cols = gridColumns(valid.length);
  const rows = Math.ceil(valid.length / cols);
  const gap = 2.5;
  const captionH = 4;
  const cellW = (CONTENT_WIDTH - gap * (cols - 1)) / cols;
  const maxGridH = FOOTER_Y - y - 8;
  const cellImgH = Math.min(
    48,
    Math.max(18, (maxGridH - rows * (captionH + gap)) / rows),
  );
  const rowH = cellImgH + captionH + gap;

  valid.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = MARGIN + col * (cellW + gap);
    const cellY = y + row * rowH;

    const { img } = item;
    const scale = Math.min(cellW / img.width, cellImgH / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const offsetX = x + (cellW - w) / 2;

    doc.addImage(item.img.dataUrl, 'JPEG', offsetX, cellY, w, h);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const capLines = wrapText(doc, item.caption, cellW);
    doc.text(capLines.slice(0, 2), x, cellY + cellImgH + 2.5);
  });

  return y + rows * rowH + 6;
}

function drawPageFooter(doc, pageNum) {
  doc.setFontSize(7);
  doc.setTextColor(140, 140, 140);
  doc.text('AssetCues · Asset Intelligence Report', MARGIN, FOOTER_Y);
  doc.text(`Page ${pageNum}`, PAGE_WIDTH - MARGIN, FOOTER_Y, { align: 'right' });
  doc.setTextColor(30, 30, 30);
}

/** Clickable link to open the live report in the browser. */
function drawViewAssetLink(doc, entry, startY) {
  const url = buildAssetReportUrl(entry);
  if (!url) return startY;

  let y = startY + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(37, 99, 235);
  doc.textWithLink('View this asset online', MARGIN, y, { url });

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const urlLines = wrapText(doc, url, CONTENT_WIDTH);
  doc.text(urlLines.slice(0, 2), MARGIN, y + 4.5);

  return y + 4.5 + Math.min(urlLines.length, 2) * 3.2 + 4;
}

/**
 * @param {object} entry
 */
export async function exportAssetReportPdf(entry) {
  if (!entry) throw new Error('No report data to export');

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageState = { num: 1 };
  let y = MARGIN;

  const ensureSpace = (neededMm) => {
    if (y + neededMm > FOOTER_Y - 6) {
      drawPageFooter(doc, pageState.num);
      doc.addPage();
      pageState.num += 1;
      y = MARGIN;
    }
  };

  // Compact header
  try {
    const logo = await prepareImageForPdf(companyLogoUrl, 320, 0.75);
    const logoW = 36;
    const logoH = Math.min(12, (logo.height / logo.width) * logoW);
    doc.addImage(logo.dataUrl, 'JPEG', MARGIN, y, logoW, logoH);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235);
    doc.text('AssetCues', MARGIN, y + 5);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Asset Intelligence Report', PAGE_WIDTH - MARGIN, y + 4, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(formatDateTime(new Date()), PAGE_WIDTH - MARGIN, y + 8, { align: 'right' });
  y += 14;

  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  const titleLines = wrapText(doc, entry.asset_name || 'Asset report', CONTENT_WIDTH);
  doc.text(titleLines.slice(0, 2), MARGIN, y);
  y += titleLines.length > 1 ? 10 : 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Condition: ${entry.condition || '—'}  ·  Tag: ${entry.detected_tag_number_raw || '—'}`,
    MARGIN,
    y,
  );
  y += 5;

  y = drawViewAssetLink(doc, entry, y);

  const imageItems = collectReportImages(entry);
  if (imageItems.length > 0) {
    y = await drawImagesGrid(doc, imageItems, y);
    y += 4;
  }

  const sections = buildFieldSections(entry);
  for (const section of sections) {
    ensureSpace(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text(section.title, MARGIN, y);
    y += 5;

    for (const [label, value] of section.fields) {
      const valueLines = wrapText(doc, value, CONTENT_WIDTH - LABEL_COL);
      const lineCount = Math.min(valueLines.length, 6);
      const blockH = Math.max(4.5, lineCount * 3.6) + 2;
      ensureSpace(blockH);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${label}:`, MARGIN, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(valueLines.slice(0, 6), MARGIN + LABEL_COL, y);
      y += blockH;
    }
    y += 2;
  }

  ensureSpace(10);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    wrapText(
      doc,
      'AI-generated report from AssetCues. Verify before operational or financial use.',
      CONTENT_WIDTH,
    ),
    MARGIN,
    y,
  );

  drawPageFooter(doc, pageState.num);

  const filename = `AssetCues-Report-${sanitizeFilename(entry.asset_name)}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
