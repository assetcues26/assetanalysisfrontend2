import React from 'react';
import useAuditStore from '../store/useAuditStore';

const SessionProgress = () => {
  const { currentPairIndex, currentStep } = useAuditStore();

  return (
    <div className="session-progress">
      Pair #{currentPairIndex + 1} | Current: {currentStep}
    </div>
  );
};

export default SessionProgress;
