import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Upload } from 'lucide-react';
import { Button } from '../ui/button';

const ACCEPT = 'image/jpeg,image/png,image/webp';

export function DropZone({ onFilesSelected, disabled, onRejectedFiles }) {
  const [dragOver, setDragOver] = useState(false);
  const inputId = 'file-upload-input';

  const handleFiles = useCallback(
    (fileList) => {
      if (!fileList?.length || disabled) return;
      const all = Array.from(fileList);
      const files = all.filter((f) =>
        ACCEPT.split(',').some((t) => f.type === t.trim()),
      );
      const skipped = all.length - files.length;
      if (skipped > 0 && onRejectedFiles) {
        onRejectedFiles(skipped);
      }
      if (files.length) onFilesSelected(files);
    },
    [onFilesSelected, disabled, onRejectedFiles],
  );

  return (
    <motion.div
      data-testid="drop-zone"
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-6 transition-colors duration-200 sm:gap-5 sm:p-10 ${
        dragOver
          ? 'border-blue-400 bg-blue-50/80'
          : 'border-gray-200 bg-white/80 backdrop-blur-sm'
      } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
        <Upload size={32} strokeWidth={1.75} />
      </div>
      <div className="max-w-md text-center">
        <p className="text-lg font-semibold text-gray-900">Drag & drop images here</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          JPEG, PNG, or WebP. Select one file to preview first, or multiple files to add directly
          to your batch.
        </p>
      </div>
      <div className="flex w-full max-w-xs items-center gap-3 text-gray-500">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium uppercase tracking-wide">or</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <label htmlFor={inputId}>
        <Button
          variant="default"
          onClick={() => document.getElementById(inputId)?.click()}
          ariaLabel="Browse files"
        >
          <ImagePlus size={18} strokeWidth={2} aria-hidden />
          Browse files
        </Button>
      </label>
      <input
        id={inputId}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </motion.div>
  );
}
