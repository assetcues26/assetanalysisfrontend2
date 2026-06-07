import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

const STORAGE_KEY = 'assetlens_history';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();

  global.URL.createObjectURL = vi.fn(() => 'blob:mock-preview-url');
  global.URL.revokeObjectURL = vi.fn();

  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    blob: async () => new Blob(['img'], { type: 'image/jpeg' }),
  });

  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
  }));
  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => 'data:image/jpeg;base64,mock-history-image',
  );

  global.Image = class MockImage {
    constructor() {
      this.naturalWidth = 800;
      this.naturalHeight = 600;
      this.width = 800;
      this.height = 600;
    }

    set src(_value) {
      queueMicrotask(() => this.onload?.());
    }
  };

  Object.defineProperty(global.navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        active: true,
        getTracks: () => [{ stop: vi.fn() }],
      }),
    },
  });

  HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  } else {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
  }
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  localStorage.removeItem(STORAGE_KEY);
});
