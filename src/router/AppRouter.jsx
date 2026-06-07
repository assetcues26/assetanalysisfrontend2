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
import { DemoV6CatalogPage } from '../pages/demo/DemoV6CatalogPage';
import { DemoV6AssetPage } from '../pages/demo/DemoV6AssetPage';
import { DemoV6CapturePage } from '../pages/demo/DemoV6CapturePage';
import { DemoV6UploadPage } from '../pages/demo/DemoV6UploadPage';
import { DemoV6BatchPage } from '../pages/demo/DemoV6BatchPage';
import { DemoV6ProcessingPage } from '../pages/demo/DemoV6ProcessingPage';
import { DemoV6ResultPage } from '../pages/demo/DemoV6ResultPage';
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
      <Route path="/demo/v6" element={<DemoV6CatalogPage />} />
      <Route path="/demo/v6/asset/:catalogId" element={<DemoV6AssetPage />} />
      <Route path="/demo/v6/capture" element={<DemoV6CapturePage />} />
      <Route path="/demo/v6/upload" element={<DemoV6UploadPage />} />
      <Route path="/demo/v6/batch" element={<DemoV6BatchPage />} />
      <Route path="/demo/v6/processing" element={<DemoV6ProcessingPage />} />
      <Route path="/demo/v6/result/:id" element={<DemoV6ResultPage />} />
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
