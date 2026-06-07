import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { isDemoSeedEntry } from '../utils/mockData';
import { persistEntryImages } from '../utils/blobUrls';

const STORAGE_KEY = 'assetlens_history';

const HistoryContext = createContext(null);

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persistHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('History storage full; saving without new image data', err);
    const slim = entries.map((entry) => ({
      ...entry,
      mergedImageUrl: entry.mergedImageUrl?.startsWith('data:')
        ? entry.mergedImageUrl
        : undefined,
      previewUrls: (entry.previewUrls || []).filter((url) => url.startsWith('data:')),
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
    } catch {
      /* ignore */
    }
  }
}

/** Remove legacy demo seed rows from persisted history (one-time cleanup on load). */
export function stripDemoSeedEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.filter((entry) => !isDemoSeedEntry(entry));
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadHistory();
    const cleaned = stripDemoSeedEntries(stored ?? []);
    if (stored && cleaned.length !== stored.length) {
      persistHistory(cleaned);
    }
    setHistory(cleaned);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistHistory(history);
  }, [history, hydrated]);

  const addEntry = useCallback(async (entry) => {
    const id = entry.id || `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const processedAt = entry.processedAt || new Date().toISOString();
    const newEntry = { ...entry, id, processedAt };

    setHistory((prev) => {
      const withoutDuplicate = entry.request_id
        ? prev.filter((e) => e.request_id !== entry.request_id)
        : prev.filter((e) => e.id !== id);
      return [newEntry, ...withoutDuplicate];
    });

    const needsPersist =
      newEntry.mergedImageUrl?.startsWith('blob:') ||
      newEntry.previewUrls?.some((url) => url?.startsWith('blob:'));

    if (needsPersist) {
      try {
        const persisted = await persistEntryImages(newEntry);
        setHistory((prev) => prev.map((e) => (e.id === id ? persisted : e)));
        return persisted;
      } catch (err) {
        console.warn('Could not persist history images', err);
      }
    }

    return newEntry;
  }, []);

  const deleteEntry = useCallback((id) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEntryById = useCallback(
    (id) => history.find((e) => e.id === id || e.request_id === id),
    [history],
  );

  const searchEntries = useCallback(
    (query) => {
      const q = query.trim().toLowerCase();
      if (!q) return history;
      return history.filter((entry) => {
        const name = (entry.asset_name || '').toLowerCase();
        const tag = (entry.detected_tag_number_raw || '').toLowerCase();
        const labels = (entry.visible_labels || []).join(' ').toLowerCase();
        return name.includes(q) || tag.includes(q) || labels.includes(q);
      });
    },
    [history],
  );

  const isSaved = useCallback(
    (requestId) => history.some((e) => e.request_id === requestId),
    [history],
  );

  const value = useMemo(
    () => ({
      history,
      hydrated,
      addEntry,
      deleteEntry,
      getEntryById,
      searchEntries,
      isSaved,
      historyCount: history.length,
    }),
    [history, hydrated, addEntry, deleteEntry, getEntryById, searchEntries, isSaved],
  );

  return (
    <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
  );
}

export function useHistoryContext() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistoryContext must be used within HistoryProvider');
  return ctx;
}
