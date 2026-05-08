import React from 'react';
import useAuditStore from './store/useAuditStore';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Processing from './components/Processing';
import AuditResults from './components/AuditResults';
import NotificationModal from './components/NotificationModal';

function App() {
  const { sessionState, notification, hideNotification } = useAuditStore();

  return (
    <div className="app-container">
      {sessionState === 'IDLE' && <Home />}
      
      {(sessionState === 'CAPTURING' || sessionState === 'PREVIEW') && <Scanner />}
      
      {sessionState === 'PROCESSING' && <Processing />}
      
      {sessionState === 'RESULTS' && <AuditResults />}

      <NotificationModal 
        isOpen={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
        onConfirm={notification.onConfirm || hideNotification}
      />
    </div>
  );
}

export default App;

