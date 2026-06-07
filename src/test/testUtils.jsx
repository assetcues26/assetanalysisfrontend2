import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppContext';
import { BatchProvider } from '../context/BatchContext';
import { CameraProvider } from '../context/CameraContext';
import { HistoryProvider } from '../context/HistoryContext';
import { ToastContainer } from '../components/ui/Toast';
import { AppRoutes } from '../router/AppRouter';

export function createTestImageFile(name = 'test-asset.jpg', type = 'image/jpeg') {
  return new File(['mock-binary-image-data'], name, { type });
}

export function renderWithProviders(ui, { route = '/', routes } = {}) {
  const initialEntries = routes ?? [route];
  return render(
    <AppProvider>
      <CameraProvider>
        <HistoryProvider>
          <BatchProvider>
            <MemoryRouter initialEntries={initialEntries}>
              {ui}
            </MemoryRouter>
            <ToastContainer />
          </BatchProvider>
        </HistoryProvider>
      </CameraProvider>
    </AppProvider>,
  );
}

export function renderAppAt(route = '/') {
  return renderWithProviders(<AppRoutes />, { route });
}

export function seedLocalHistory(entries) {
  localStorage.setItem('assetlens_history', JSON.stringify(entries));
}

export async function waitForHistoryHydration() {
  await vi.waitFor(() => {
    expect(localStorage.getItem('assetlens_history')).not.toBeNull();
  });
}

export { SEED_HISTORY } from '../utils/mockData';
