import { describe, expect, it } from 'vitest';
import { getValuationBullets, splitProseToBullets } from './valuationBullets';

describe('valuationBullets', () => {
  it('splits legacy paragraphs into punctuated bullets', () => {
    const bullets = splitProseToBullets('First point here. Second point follows');
    expect(bullets).toHaveLength(2);
    expect(bullets[0]).toMatch(/\.$/);
  });

  it('prefers points arrays from API', () => {
    const bullets = getValuationBullets(
      {
        nbv_vs_market_points: ['Book NBV from ERP is the baseline.'],
        nbv_vs_market_note: 'Legacy paragraph should be ignored.',
      },
      'nbv_vs_market',
    );
    expect(bullets).toHaveLength(1);
    expect(bullets[0]).toContain('Book NBV');
  });
});
