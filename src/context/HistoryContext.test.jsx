import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  HistoryProvider,
  useHistoryContext,
  stripDemoSeedEntries,
} from './HistoryContext';
import { SEED_HISTORY } from '../utils/mockData';
import { seedLocalHistory } from '../test/testUtils';

const STORAGE_KEY = 'assetlens_history';

function wrapper({ children }) {
  return <HistoryProvider>{children}</HistoryProvider>;
}

describe('HistoryContext', () => {
  it('throws outside provider', () => {
    expect(() => renderHook(() => useHistoryContext())).toThrow(/HistoryProvider/);
  });

  it('starts with empty history when localStorage is empty', async () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });
    await waitFor(() => {
      expect(result.current.hydrated).toBe(true);
      expect(result.current.historyCount).toBe(0);
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });

  it('loads existing history from localStorage', async () => {
    const custom = [{ ...SEED_HISTORY[0], id: 'custom-1' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    const { result } = renderHook(() => useHistoryContext(), { wrapper });
    await waitFor(() => {
      expect(result.current.historyCount).toBe(1);
      expect(result.current.getEntryById('custom-1')).toBeTruthy();
    });
  });

  it('removes legacy demo seed entries on load', async () => {
    seedLocalHistory(SEED_HISTORY);
    const { result } = renderHook(() => useHistoryContext(), { wrapper });
    await waitFor(() => {
      expect(result.current.hydrated).toBe(true);
      expect(result.current.historyCount).toBe(0);
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toEqual([]);
  });

  it('stripDemoSeedEntries keeps real scans', () => {
    const real = { id: 'hist-real-1', asset_name: 'Real Unit' };
    const cleaned = stripDemoSeedEntries([...SEED_HISTORY, real]);
    expect(cleaned).toEqual([real]);
  });

  it('adds, searches, deletes, and checks isSaved', async () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    let entry;
    await act(async () => {
      entry = await result.current.addEntry({
        asset_name: 'Test Compressor',
        request_id: 'req_test_99',
        detected_tag_number_raw: 'TST-001',
        visible_labels: ['TestCo'],
        condition: 'Good',
      });
    });

    expect(result.current.getEntryById(entry.id)).toBeTruthy();
    expect(result.current.isSaved('req_test_99')).toBe(true);

    const found = result.current.searchEntries('compressor');
    expect(found.some((e) => e.id === entry.id)).toBe(true);

    act(() => {
      result.current.deleteEntry(entry.id);
    });
    expect(result.current.getEntryById(entry.id)).toBeUndefined();
  });

  it('replaces existing entry when same request_id is added again', async () => {
    const { result } = renderHook(() => useHistoryContext(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));

    await act(async () => {
      await result.current.addEntry({
        request_id: 'req_dup_test',
        asset_name: 'First Name',
        detected_tag_number_raw: 'TAG-1',
      });
    });
    await act(async () => {
      await result.current.addEntry({
        request_id: 'req_dup_test',
        asset_name: 'Updated Name',
        detected_tag_number_raw: 'TAG-1',
      });
    });

    const matches = result.current.history.filter((e) => e.request_id === 'req_dup_test');
    expect(matches).toHaveLength(1);
    expect(matches[0].asset_name).toBe('Updated Name');
  });

  it('finds entry by request_id', async () => {
    seedLocalHistory([{ ...SEED_HISTORY[0], id: 'custom-req-lookup' }]);
    const { result } = renderHook(() => useHistoryContext(), { wrapper });
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.getEntryById(SEED_HISTORY[0].request_id)?.id).toBe(
      'custom-req-lookup',
    );
  });
});
