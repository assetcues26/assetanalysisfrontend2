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
import { MobileCapturePage } from '../pages/scan/MobileCapturePage';
import { MobilePreviewPage } from '../pages/scan/MobilePreviewPage';
import { MobileProcessingPage } from '../pages/scan/MobileProcessingPage';
import { MobileScanLandingPage } from '../pages/scan/MobileScanLandingPage';
import { MobileUploadPage } from '../pages/scan/MobileUploadPage';
import { MobileUploadSuccessPage } from '../pages/scan/MobileUploadSuccessPage';
import { MobileWaitingPage } from '../pages/scan/MobileWaitingPage';
import { SessionProvider } from '../context/SessionContext';
import { V6_DEMO_ENABLED } from '../config/features';
import { useMergedBatch } from '../hooks/useMergedBatch';

function BatchGuard({ children }) {
  const { batchCount } = useMergedBatch();
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
        <Route path="/scan/:token" element={<MobileScanLandingPage />} />
        <Route path="/scan/:token/capture" element={<MobileCapturePage />} />
        <Route path="/scan/:token/upload" element={<MobileUploadPage />} />
        <Route path="/scan/:token/preview" element={<MobilePreviewPage />} />
        <Route path="/scan/:token/done" element={<MobileUploadSuccessPage />} />
        <Route path="/scan/:token/waiting" element={<MobileWaitingPage />} />
        <Route path="/scan/:token/processing" element={<MobileProcessingPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
        <Route path="/asset/:id" element={<AssetDetailPage />} />
        {V6_DEMO_ENABLED && (
          <>
            <Route path="/v6" element={<V6CatalogPage />} />
            <Route path="/v6/asset/:catalogId" element={<V6AssetPage />} />
            <Route path="/v6/capture" element={<V6CapturePage />} />
            <Route path="/v6/upload" element={<V6UploadPage />} />
            <Route path="/v6/batch" element={<V6BatchPage />} />
            <Route path="/v6/processing" element={<V6ProcessingPage />} />
            <Route path="/v6/result/:id" element={<V6ResultPage />} />
          </>
        )}
        {!V6_DEMO_ENABLED && <Route path="/v6/*" element={<Navigate to="/" replace />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <AppRoutes />
      </SessionProvider>
    </BrowserRouter>
  );
}
