import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CameraProvider } from '../../context/CameraContext';
import { CameraRouteSync } from './CameraRouteSync';

const ensureActive = vi.fn();
const releaseStream = vi.fn();

vi.mock('../../hooks/useCamera', () => ({
  useCamera: () => ({
    ensureActive,
    releaseStream,
  }),
}));

function renderAt(path) {
  return render(
    <CameraProvider>
      <MemoryRouter initialEntries={[path]}>
        <CameraRouteSync />
        <Routes>
          <Route path="/capture" element={<div>Capture</div>} />
          <Route path="/upload" element={<div>Upload</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </CameraProvider>,
  );
}

describe('CameraRouteSync', () => {
  beforeEach(() => {
    ensureActive.mockClear();
    releaseStream.mockClear();
  });

  it('releases the stream on non-capture routes', () => {
    renderAt('/upload');
    expect(releaseStream).toHaveBeenCalled();
    expect(ensureActive).not.toHaveBeenCalled();
  });

  it('starts the camera only on /capture', () => {
    renderAt('/capture');
    expect(ensureActive).toHaveBeenCalled();
    expect(releaseStream).not.toHaveBeenCalled();
  });
});
