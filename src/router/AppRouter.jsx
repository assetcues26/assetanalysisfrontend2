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
import { V6CatalogPage } from '../pages/v6/V6CatalogPage';
import { V6AssetPage } from '../pages/v6/V6AssetPage';
import { V6CapturePage } from '../pages/v6/V6CapturePage';
import { V6UploadPage } from '../pages/v6/V6UploadPage';
import { V6BatchPage } from '../pages/v6/V6BatchPage';
import { V6ProcessingPage } from '../pages/v6/V6ProcessingPage';
import { V6ResultPage } from '../pages/v6/V6ResultPage';
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
        <Route path="/v6" element={<V6CatalogPage />} />
        <Route path="/v6/asset/:catalogId" element={<V6AssetPage />} />
        <Route path="/v6/capture" element={<V6CapturePage />} />
        <Route path="/v6/upload" element={<V6UploadPage />} />
        <Route path="/v6/batch" element={<V6BatchPage />} />
        <Route path="/v6/processing" element={<V6ProcessingPage />} />
        <Route path="/v6/result/:id" element={<V6ResultPage />} />
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
