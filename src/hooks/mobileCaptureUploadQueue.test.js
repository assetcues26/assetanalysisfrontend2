import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  enqueueMobileCapture,
  getMobileCaptureQueueSnapshot,
  runMobileCaptureQueue,
} from './mobileCaptureUploadQueue';

vi.mock('../services/sessionApi', () => ({
  uploadSessionImagesPrepared: vi.fn(),
}));

import { uploadSessionImagesPrepared } from '../services/sessionApi';

describe('mobileCaptureUploadQueue', () => {
  const refresh = vi.fn(async () => null);
  const showToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    uploadSessionImagesPrepared.mockImplementation(async () => ({
      status: 'active',
      image_count: 1,
      images: [{ byte_size: 1000 }],
    }));
  });

  it('keeps processing after handlers are reattached', async () => {
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const handlers = {
      getSessionImages: () => [],
      refresh,
      showToast,
    };

    enqueueMobileCapture('token-a', file, handlers);
    await runMobileCaptureQueue('token-a', handlers);

    expect(uploadSessionImagesPrepared).toHaveBeenCalledTimes(1);
    expect(getMobileCaptureQueueSnapshot('token-a').pendingCount).toBe(0);
    expect(refresh).toHaveBeenCalled();
  });
});
