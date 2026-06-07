import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingSettings } from './LandingSettings';
import { AppProvider } from '../../context/AppContext';
import {
  UPLOAD_MODE_LABELS,
  UPLOAD_MODE_STORAGE_KEY,
  UPLOAD_PROCESSING_MODES,
} from '../../constants/uploadMode';

describe('LandingSettings', () => {
  it('saves direct upload mode when selected', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <LandingSettings />
      </AppProvider>,
    );

    await user.click(screen.getByLabelText('Processing settings'));
    await user.click(screen.getByText(UPLOAD_MODE_LABELS[UPLOAD_PROCESSING_MODES.DIRECT]));

    expect(localStorage.getItem(UPLOAD_MODE_STORAGE_KEY)).toBe(
      UPLOAD_PROCESSING_MODES.DIRECT,
    );
  });
});
