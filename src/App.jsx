import { AppProvider } from './context/AppContext';
import { BatchProvider } from './context/BatchContext';
import { CameraProvider } from './context/CameraContext';
import { HistoryProvider } from './context/HistoryContext';
import { V6Provider } from './context/V6SessionContext';
import { ToastContainer } from './components/ui/Toast';
import { AppRouter } from './router/AppRouter';

export default function App() {
  return (
    <AppProvider>
      <CameraProvider>
        <HistoryProvider>
          <BatchProvider>
            <V6Provider>
              <AppRouter />
              <ToastContainer />
            </V6Provider>
          </BatchProvider>
        </HistoryProvider>
      </CameraProvider>
    </AppProvider>
  );
}
