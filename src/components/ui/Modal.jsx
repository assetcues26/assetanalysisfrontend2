import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './button';

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-3 pb-safe sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
            aria-label="Close modal"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
          >
            <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onCancel}>
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant === 'danger' ? 'destructive' : 'primary'}
                className={
                  confirmVariant === 'danger'
                    ? 'w-full border-0 bg-red-600 text-white hover:bg-red-700 focus-visible:bg-red-700 sm:w-auto'
                    : 'w-full sm:w-auto'
                }
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
