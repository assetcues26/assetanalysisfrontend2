import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingSettings } from './LandingSettings';
import { AppProvider, useApp } from '../../context/AppContext';
import {
  UPLOAD_MODE_LABELS,
  UPLOAD_PROCESSING_MODES,
} from '../../constants/uploadMode';

function Harness() {
  const { uploadProcessingMode } = useApp();
  return (
    <>
      <LandingSettings />
      <span data-testid="upload-mode">{uploadProcessingMode}</span>
    </>
  );
}

describe('LandingSettings', () => {
  it('updates direct upload mode in app context when selected', async () => {
    const user = userEvent.setup();
    render(
      <AppProvider>
        <Harness />
      </AppProvider>,
    );

    await user.click(screen.getByLabelText('Processing settings'));
    await user.click(screen.getByText(UPLOAD_MODE_LABELS[UPLOAD_PROCESSING_MODES.DIRECT]));

    await waitFor(() => {
      expect(screen.getByTestId('upload-mode')).toHaveTextContent(
        UPLOAD_PROCESSING_MODES.DIRECT,
      );
    });
  });
});
