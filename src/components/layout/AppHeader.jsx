import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { LandingSettings } from '../landing/LandingSettings';

const navLinks = [
  { to: '/capture', label: 'Capture' },
  { to: '/upload', label: 'Upload' },
  { to: '/history', label: 'History' },
];

export function AppHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 pt-safe backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between gap-2 px-safe sm:h-16 sm:gap-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
        <Link to="/" className="flex shrink-0 items-center touch-manipulation" aria-label="Home">
          <BrandLogo className="h-8 w-auto sm:h-11 md:h-12" />
        </Link>
        <nav
          className="relative flex min-w-0 flex-1 items-center justify-end gap-0.5 sm:gap-2"
          aria-label="Main navigation"
        >
          <LandingSettings />
          <Link
            to="/v6"
            className={`touch-target touch-manipulation shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200 sm:px-3 sm:text-sm ${
              location.pathname.startsWith('/v6')
                ? 'bg-violet-100 text-violet-900'
                : 'text-violet-700 hover:bg-violet-50 hover:text-violet-900'
            }`}
          >
            V6 Endpoint
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`touch-target touch-manipulation shrink-0 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200 sm:px-3 sm:text-sm ${
                location.pathname === link.to
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function CompactHeader({
  title,
  center,
  ariaLabel,
  left,
  right,
  variant = 'light',
}) {
  const isDark = variant === 'dark';
  const label = ariaLabel || (typeof title === 'string' ? title : undefined);

  return (
    <header
      aria-label={label}
      className={`sticky top-0 z-40 flex h-14 min-h-[3.5rem] items-center justify-between border-b px-safe pt-safe backdrop-blur-md ${
        isDark ? 'border-gray-800 bg-gray-950/95' : 'border-gray-200 bg-white/95'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>
      <div className="flex shrink-0 items-center justify-center px-2">
        {center ?? (
          <h1
            className={`truncate text-center text-sm font-semibold sm:text-base ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h1>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">{right}</div>
    </header>
  );
}

export function ProgressPill({ current, max, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        isDark
          ? 'border-gray-600 bg-gray-800 text-blue-300'
          : 'border-blue-200 bg-blue-50 text-blue-700'
      }`}
    >
      {current} / {max}
    </span>
  );
}
