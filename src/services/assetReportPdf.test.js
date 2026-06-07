import { describe, it, expect, vi, beforeEach } from 'vitest';

const save = vi.fn();
const addImage = vi.fn();
const addPage = vi.fn();
const text = vi.fn();
const line = vi.fn();
const splitTextToSize = vi.fn((t) => [String(t)]);
const setFont = vi.fn();
const setFontSize = vi.fn();
const setTextColor = vi.fn();
const setDrawColor = vi.fn();
const setLineWidth = vi.fn();

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    addImage,
    addPage,
    text,
    textWithLink: (label, x, y) => text(label, x, y),
    link: vi.fn(),
    line,
    splitTextToSize,
    setFont,
    setFontSize,
    setTextColor,
    setDrawColor,
    setLineWidth,
    save,
  })),
}));

import { exportAssetReportPdf } from './assetReportPdf';

describe('exportAssetReportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.Image = class {
      constructor() {
        this.naturalWidth = 400;
        this.naturalHeight = 300;
        this.width = 400;
        this.height = 300;
      }

      set src(_v) {
        queueMicrotask(() => this.onload?.());
      }
    };
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    }));
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,abc');
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['x'], { type: 'image/png' }),
    });
  });

  it('generates and saves a PDF for a full entry', async () => {
    vi.stubGlobal('window', {
      location: { origin: 'http://localhost:5173' },
    });

    await exportAssetReportPdf({
      id: 'hist-pdf-test-1',
      asset_name: 'Test Chiller',
      condition: 'Good',
      request_id: 'req-pdf-1',
      processing_time_ms: 5000,
      analysis_method: 'collage',
      processingMode: 'collage',
      mergedImageUrl: 'data:image/jpeg;base64,abc',
      previewUrls: ['data:image/jpeg;base64,def'],
      asset: { brand: 'York', category: 'HVAC' },
      conditionDetail: { grade: 'Good', summary: 'OK' },
      detected_tag_number_raw: 'TAG-99',
      asset_description: 'Unit description',
      token_usage: { total_tokens: 1000 },
      cost: { total_cost_usd: 0.002, model: 'test-model' },
    });

    expect(save).toHaveBeenCalled();
    expect(save.mock.calls[0][0]).toMatch(/AssetCues-Report-Test-Chiller/);
    expect(text).toHaveBeenCalled();
  });
});
