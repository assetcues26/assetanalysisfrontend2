import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set as idbSet, del } from 'idb-keyval';
import { submitAuditSession } from '../services/api';

// Custom storage engine for IndexedDB using idb-keyval
const idbStorage = {
  getItem: async (name) => {
    return (await get(name)) || null;
  },
  setItem: async (name, value) => {
    await idbSet(name, value);
  },
  removeItem: async (name) => {
    await del(name);
  },
};

const useAuditStore = create(
  persist(
    (set, get) => ({
      sessionState: 'IDLE', // IDLE, CAPTURING, PREVIEW, PROCESSING, RESULTS
      sessionId: null,
      pairs: [], // List of {asset: blob/base64, barcode: blob/base64, barcode_skipped: bool}
      currentStep: 'ASSET', // ASSET, BARCODE
      currentPairIndex: 0,
      results: [],
      recentSessions: [], // {id, date, assetsCount, status}
      notification: { open: false, message: '', type: 'info', onConfirm: null },
      tempImage: null, // Temporary image for preview

      setNotification: (notif) => set({ notification: { ...get().notification, ...notif } }),
      hideNotification: () => set({ notification: { open: false, message: '', type: 'info', onConfirm: null } }),

      startSession: () => set({ 
        sessionState: 'CAPTURING', 
        sessionId: crypto.randomUUID(),
        pairs: [],
        currentStep: 'ASSET',
        currentPairIndex: 0,
        tempImage: null
      }),

      captureImage: (image) => set({ 
        tempImage: image, 
        sessionState: 'PREVIEW' 
      }),

      confirmImage: () => set((state) => {
        const newPairs = [...state.pairs];
        const image = state.tempImage;

        if (state.currentStep === 'ASSET') {
          newPairs[state.currentPairIndex] = { asset: image, barcode: null, barcode_skipped: false };
          return { 
            pairs: newPairs, 
            tempImage: null,
            currentStep: 'BARCODE', 
            sessionState: 'CAPTURING' 
          };
        } else {
          newPairs[state.currentPairIndex].barcode = image;
          return { 
            pairs: newPairs, 
            tempImage: null,
            currentStep: 'ASSET', 
            sessionState: 'CAPTURING', 
            currentPairIndex: state.currentPairIndex + 1 
          };
        }
      }),

      skipBarcode: () => set((state) => {
        const newPairs = [...state.pairs];
        newPairs[state.currentPairIndex].barcode_skipped = true;
        return { 
          pairs: newPairs,
          currentStep: 'ASSET', 
          sessionState: 'CAPTURING', 
          currentPairIndex: state.currentPairIndex + 1 
        };
      }),

      retakeImage: () => set({ 
        sessionState: 'CAPTURING',
        tempImage: null
      }),

      setProcessing: () => set({ sessionState: 'PROCESSING' }),
      
      setResults: (results) => set((state) => {
        const newSession = {
          id: state.sessionId,
          date: new Date().toISOString(),
          assetsCount: results.length,
          status: 'Complete',
          results: results // Store results in the session history
        };
        return { 
          sessionState: 'RESULTS', 
          results,
          recentSessions: [newSession, ...state.recentSessions].slice(0, 10),
          pairs: [], // Clear pairs after successful submission
          sessionId: null
        };
      }),
      
      deleteSession: (sessionId) => set((state) => ({
        recentSessions: state.recentSessions.filter(s => s.id !== sessionId)
      })),

      viewSessionResults: (session) => set({
        sessionState: 'RESULTS',
        results: session.results,
        sessionId: session.id
      }),

      submitSession: async () => {
        const state = useAuditStore.getState();

        // Offline check
        if (!navigator.onLine) {
          state.setNotification({ 
            open: true, 
            message: 'System is Offline. Images cannot be processed right now. Your audit has been saved locally and can be resumed/submitted when you are back online.' 
          });
          set({ sessionState: 'IDLE' });
          return;
        }

        set({ sessionState: 'PROCESSING' });

        try {
          const results = await submitAuditSession(state.sessionId || crypto.randomUUID(), state.pairs);
          useAuditStore.getState().setResults(results);
        } catch (error) {
          console.error('Audit failed:', error);
          set({ sessionState: 'IDLE' });
          state.setNotification({ open: true, message: 'Failed to process audit. Please check your connection.' });
        }
      },

      // Clear the current active session (discard unsaved pairs)
      clearCurrentSession: () => set({
        pairs: [],
        sessionId: null,
        currentStep: 'ASSET',
        currentPairIndex: 0
      }),

      // Pause session for offline mode (keeps pairs)
      pauseSession: () => set({ sessionState: 'IDLE' }),

      // Full reset for a brand new start
      reset: () => set({ 
        sessionState: 'IDLE', 
        pairs: [], 
        currentPairIndex: 0, 
        results: [],
        sessionId: null,
        currentStep: 'ASSET',
        tempImage: null
      })
    }),
    {
      name: 'audit-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);

export default useAuditStore;
