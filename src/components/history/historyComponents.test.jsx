import { describe, it, expect, vi } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { MemoryRouter } from 'react-router-dom';

import { HistorySearch } from './HistorySearch';

import { HistoryGrid } from './HistoryGrid';

import { HistoryAssetCard } from './HistoryAssetCard';

import { SEED_HISTORY } from '../../utils/mockData';
import { AppProvider } from '../../context/AppContext';
import { ToastContainer } from '../ui/Toast';

vi.mock('../../services/assetReportPdf', () => ({
  exportAssetReportPdf: vi.fn().mockResolvedValue(undefined),
}));

function renderHistory(ui) {
  return render(
    <AppProvider>
      <MemoryRouter>{ui}</MemoryRouter>
      <ToastContainer />
    </AppProvider>,
  );
}



describe('History components', () => {

  it('HistorySearch calls onChange', async () => {

    const onChange = vi.fn();

    const user = userEvent.setup();

    render(<HistorySearch value="" onChange={onChange} />);

    await user.type(screen.getByRole('searchbox'), 'Carrier');

    expect(onChange).toHaveBeenCalled();

  });



  it('HistoryGrid renders cards for entries', () => {

    renderHistory(<HistoryGrid entries={SEED_HISTORY} onDelete={vi.fn()} />);

    expect(screen.getByText('Carrier Split AC Unit')).toBeInTheDocument();

    expect(screen.getByText('Apple Macbook Pro')).toBeInTheDocument();

  });



  it('HistoryAssetCard expands details and deletes', async () => {

    const onDelete = vi.fn();

    const onToggleExpand = vi.fn();

    const user = userEvent.setup();

    const { rerender } = renderHistory(
      <HistoryAssetCard
        entry={SEED_HISTORY[0]}
        onDelete={onDelete}
        expanded={false}
        onToggleExpand={onToggleExpand}
      />,
    );

    await user.click(screen.getByRole('button', { name: /View details/i }));

    expect(onToggleExpand).toHaveBeenCalledWith(SEED_HISTORY[0].id);

    rerender(
      <AppProvider>
        <MemoryRouter>
          <HistoryAssetCard
            entry={SEED_HISTORY[0]}
            onDelete={onDelete}
            expanded
            onToggleExpand={onToggleExpand}
          />
        </MemoryRouter>
        <ToastContainer />
      </AppProvider>,
    );

    expect(screen.getByText(/Asset condition/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Delete asset/i }));

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith(SEED_HISTORY[0].id));

  });

});


