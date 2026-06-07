import { describe, it, expect, beforeEach } from 'vitest';
import {
  readStoredUploadMode,
  UPLOAD_MODE_STORAGE_KEY,
  UPLOAD_PROCESSING_MODES,
} from './uploadMode';

describe('uploadMode constants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to direct multi-image when storage is empty', () => {
    expect(readStoredUploadMode()).toBe(UPLOAD_PROCESSING_MODES.DIRECT);
  });

  it('reads persisted direct mode', () => {
    localStorage.setItem(UPLOAD_MODE_STORAGE_KEY, UPLOAD_PROCESSING_MODES.DIRECT);
    expect(readStoredUploadMode()).toBe(UPLOAD_PROCESSING_MODES.DIRECT);
  });
});
