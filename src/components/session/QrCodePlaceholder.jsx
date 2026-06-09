import { QrCode } from 'lucide-react';

/**
 * Decorative blurred QR placeholder with a clear tap/click CTA.
 *
 * @param {{ size?: number, onClick: () => void, loading?: boolean, label?: string }} props
 */
export function QrCodePlaceholder({
  size = 180,
  onClick,
  loading = false,
  label = 'Click to generate QR',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md disabled:cursor-wait disabled:opacity-80"
      style={{ width: size, height: size }}
      aria-label={loading ? 'Generating QR code' : label}
    >
      <div
        className="absolute inset-2 scale-110 blur-[5px] opacity-60"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(90deg, #111827 50%, transparent 50%),
            linear-gradient(#111827 50%, transparent 50%)
          `,
          backgroundSize: '12px 12px',
        }}
      />
      <div
        className="absolute left-3 top-3 h-10 w-10 rounded-sm bg-gray-900 opacity-50 blur-[2px]"
        aria-hidden
      />
      <div
        className="absolute bottom-3 right-3 h-8 w-8 rounded-sm bg-gray-900 opacity-50 blur-[2px]"
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-white/55 p-4 backdrop-blur-[3px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <QrCode size={22} aria-hidden />
        </div>
        <span className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition group-hover:bg-blue-700 sm:text-sm">
          {loading ? 'Generating…' : label}
        </span>
        {!loading && (
          <span className="text-[10px] font-medium text-gray-600 sm:text-xs">Tap here</span>
        )}
      </div>
    </button>
  );
}
