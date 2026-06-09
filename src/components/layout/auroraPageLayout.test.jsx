import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../../context/AppContext';
import { AuroraPageLayout } from './AuroraPageLayout';

describe('AuroraPageLayout', () => {
  it('renders children inside aurora hero', () => {
    const { container } = render(
      <AppProvider>
        <MemoryRouter>
          <AuroraPageLayout>
            <p>Page body</p>
          </AuroraPageLayout>
        </MemoryRouter>
      </AppProvider>,
    );
    expect(screen.getByText('Page body')).toBeInTheDocument();
    expect(container.querySelector('.aurora-backdrop-layer')).toBeTruthy();
  });
});
