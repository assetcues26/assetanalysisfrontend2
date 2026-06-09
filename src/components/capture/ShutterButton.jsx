import { motion } from 'framer-motion';

export function ShutterButton({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Capture photo"
      className="relative flex h-20 w-20 items-center justify-center disabled:opacity-40"
    >
      <span className="absolute inset-0 rounded-full bg-blue-500/20" />
      <span className="absolute inset-2 rounded-full border-4 border-white/30" />
      <motion.span
        whileTap={disabled ? undefined : { scale: 0.92 }}
        className="relative z-10 h-16 w-16 rounded-full bg-white shadow-lg ring-4 ring-blue-500/50"
      />
    </button>
  );
}
