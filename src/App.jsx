import { AppProvider } from './context/AppContext';
import { BatchProvider } from './context/BatchContext';
import { CameraProvider } from './context/CameraContext';
import { HistoryProvider } from './context/HistoryContext';
import { V6Provider } from './context/V6SessionContext';
import { ToastContainer } from './components/ui/Toast';
import { AppRouter } from './router/AppRouter';
import { V6_DEMO_ENABLED } from './config/features';

function AppShell() {
  return (
    <>
      <AppRouter />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CameraProvider>
        <HistoryProvider>
          <BatchProvider>
            {V6_DEMO_ENABLED ? (
              <V6Provider>
                <AppShell />
              </V6Provider>
            ) : (
              <AppShell />
            )}
          </BatchProvider>
        </HistoryProvider>
      </CameraProvider>
    </AppProvider>
  );
}
