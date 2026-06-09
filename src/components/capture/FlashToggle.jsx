import { Zap, ZapOff, Sun } from 'lucide-react';

const modes = {
  off: { icon: ZapOff, label: 'Flash off' },
  on: { icon: Zap, label: 'Flash on' },
  auto: { icon: Sun, label: 'Flash auto' },
};

export function FlashToggle({ mode, onCycle, theme = 'light' }) {
  const { icon: Icon, label } = modes[mode] || modes.off;
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onCycle}
      aria-label={label}
      className={`touch-target touch-manipulation flex h-14 w-14 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:h-12 sm:w-12 ${
        isDark
          ? 'bg-gray-800 text-gray-100 active:bg-gray-700'
          : 'bg-gray-100/90 text-gray-800 active:bg-gray-200'
      }`}
    >
      <Icon size={22} />
    </button>
  );
}
