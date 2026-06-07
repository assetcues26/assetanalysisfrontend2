import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CameraRouteSync } from '../components/capture/CameraRouteSync';
import { LandingPage } from '../pages/LandingPage';
import { CapturePage } from '../pages/CapturePage';
import { UploadPage } from '../pages/UploadPage';
import { PreviewPage } from '../pages/PreviewPage';
import { BatchPage } from '../pages/BatchPage';
import { ProcessingPage } from '../pages/ProcessingPage';
import { ResultPage } from '../pages/ResultPage';
import { AssetDetailPage } from '../pages/AssetDetailPage';
import { HistoryPage } from '../pages/HistoryPage';
import { useBatch } from '../hooks/useBatch';
function BatchGuard({ children }) {
  const { batchCount } = useBatch();
  if (batchCount === 0) return <Navigate to="/" replace />;
  return children;
}

export function AppRoutes() {
  return (
    <>
      <CameraRouteSync />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/capture" element={<CapturePage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/preview" element={<PreviewPage />} />
      <Route
        path="/batch"
        element={
          <BatchGuard>
            <BatchPage />
          </BatchGuard>
        }
      />
      <Route path="/processing" element={<ProcessingPage />} />
      <Route path="/result/:id" element={<ResultPage />} />
      <Route path="/asset/:id" element={<AssetDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
