import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatProcessingTime,
  formatConfidence,
  formatFileSize,
  formatRelativeTime,
  formatDateTime,
  truncateText,
  normalizeCondition,
  formatUsdCost,
  formatTokenCount,
} from './formatters';

describe('formatters', () => {
  describe('formatProcessingTime', () => {
    it('formats milliseconds as seconds', () => {
      expect(formatProcessingTime(24700)).toBe('24.7 seconds');
    });

    it('returns em dash for invalid input', () => {
      expect(formatProcessingTime(null)).toBe('—');
      expect(formatProcessingTime('abc')).toBe('—');
    });
  });

  describe('formatConfidence', () => {
    it('converts ratio to percentage', () => {
      expect(formatConfidence(0.913)).toBe('91%');
    });

    it('handles invalid values', () => {
      expect(formatConfidence(null)).toBe('0%');
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes and kilobytes', () => {
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('handles zero', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-03T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns "Just now" for recent timestamps', () => {
      expect(formatRelativeTime(new Date('2026-06-03T11:59:30Z'))).toBe('Just now');
    });

    it('returns hours ago', () => {
      expect(formatRelativeTime(new Date('2026-06-03T09:00:00Z'))).toBe('3 hours ago');
    });

    it('returns days ago', () => {
      expect(formatRelativeTime(new Date('2026-06-01T12:00:00Z'))).toBe('2 days ago');
    });
  });

  describe('formatDateTime', () => {
    it('returns a localized string', () => {
      const result = formatDateTime(new Date('2026-01-15T10:30:00'));
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('truncateText', () => {
    it('truncates long strings', () => {
      const long = 'a'.repeat(150);
      expect(truncateText(long, 120).endsWith('…')).toBe(true);
    });

    it('returns short strings unchanged', () => {
      expect(truncateText('short')).toBe('short');
    });
  });

  describe('formatUsdCost and formatTokenCount', () => {
    it('formats small USD and token counts', () => {
      expect(formatUsdCost(0.002)).toBe('$0.0020');
      expect(formatTokenCount(6024)).toBe('6,024');
    });
  });

  describe('normalizeCondition', () => {
    it('maps good, fair, and poor', () => {
      expect(normalizeCondition('Good')).toBe('Good');
      expect(normalizeCondition('excellent')).toBe('Good');
      expect(normalizeCondition('Fair')).toBe('Fair');
      expect(normalizeCondition('damaged')).toBe('Poor');
      expect(normalizeCondition('')).toBe('Fair');
    });
  });
});
