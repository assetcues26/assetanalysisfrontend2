import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings } from 'lucide-react';
import {
  UPLOAD_MODE_LABELS,
  UPLOAD_PROCESSING_MODES,
} from '../../constants/uploadMode';
import { useApp } from '../../context/AppContext';

const OPTIONS = [
  {
    id: UPLOAD_PROCESSING_MODES.DIRECT,
    label: UPLOAD_MODE_LABELS[UPLOAD_PROCESSING_MODES.DIRECT],
  },
  {
    id: UPLOAD_PROCESSING_MODES.COLLAGE,
    label: UPLOAD_MODE_LABELS[UPLOAD_PROCESSING_MODES.COLLAGE],
  },
];

const PANEL_WIDTH = 320;

export function LandingSettings() {
  const { uploadProcessingMode, setUploadProcessingMode } = useApp();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - 16);
      let left = rect.right - width;
      left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
      setPanelPos({ top: rect.bottom + 8, left, width });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const panel =
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[200] cursor-default bg-black/20"
          aria-label="Close settings"
          onClick={() => setOpen(false)}
        />
        <div
          role="dialog"
          aria-label="Processing settings"
          className="fixed z-[210] rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl"
          style={{
            top: panelPos.top,
            left: panelPos.left,
            width: panelPos.width,
          }}
        >
          <p className="mb-3 text-sm font-semibold text-gray-900">Processing mode</p>
          <p className="mb-4 text-xs text-gray-500">
            Collage uses the collage API; multi-image uses the multi API. Your choice is saved
            for the next analysis.
          </p>
          <ul className="space-y-3">
            {OPTIONS.map((option) => (
              <li key={option.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/40 has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50/60">
                  <input
                    type="checkbox"
                    name="upload-processing-mode"
                    checked={uploadProcessingMode === option.id}
                    onChange={() => {
                      setUploadProcessingMode(option.id);
                      setOpen(false);
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-800">{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </>,
      document.body,
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-label="Processing settings"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Settings size={20} />
      </button>
      {panel}
    </>
  );
}
