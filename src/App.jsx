import { AppProvider } from './context/AppContext';
import { BatchProvider } from './context/BatchContext';
import { CameraProvider } from './context/CameraContext';
import { HistoryProvider } from './context/HistoryContext';
import { ToastContainer } from './components/ui/Toast';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <AppProvider>
      <CameraProvider>
        <HistoryProvider>
          <BatchProvider>
            <AppRouter />
            <ToastContainer />
          </BatchProvider>
        </HistoryProvider>
      </CameraProvider>
    </AppProvider>
  );
}
