import { useState } from 'react';
import { Camera } from 'lucide-react';
import { getAngleChecklist } from '../../v6/angleChecklists';

/**
 * Soft photo-angle guidance — local ticks only, not sent to API.
 * @param {{ category?: string, subcategory?: string, theme?: 'light' | 'dark' }} props
 */
export function AngleChecklistCard({ category, subcategory, theme = 'light' }) {
  const angles = getAngleChecklist({ category, subcategory });
  const [checked, setChecked] = useState(() => new Set());

  const toggle = (id) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isDark = theme === 'dark';
  const shell = isDark
    ? 'border-gray-700 bg-gray-900/80 text-gray-100'
    : 'border-gray-200 bg-white/90 text-gray-900';
  const hint = isDark ? 'text-gray-400' : 'text-gray-500';
  const itemIdle = isDark
    ? 'border-gray-700 hover:border-gray-600'
    : 'border-gray-100 hover:border-gray-200';

  return (
    <section className={`rounded-xl border p-4 ${shell}`}>
      <div className="mb-3 flex items-center gap-2">
        <Camera size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
        <h3 className="text-sm font-semibold">Recommended shots</h3>
        <span className={`ml-auto text-xs ${hint}`}>
          {checked.size}/{angles.length}
        </span>
      </div>
      <p className={`mb-3 text-xs ${hint}`}>
        Optional checklist — tick angles as you capture. Analysis is not blocked if you skip any.
      </p>
      <ul className="space-y-2">
        {angles.map((angle) => {
          const done = checked.has(angle.id);
          return (
            <li key={angle.id}>
              <button
                type="button"
                onClick={() => toggle(angle.id)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition ${itemIdle} ${
                  done ? (isDark ? 'border-emerald-700/60 bg-emerald-950/40' : 'border-emerald-200 bg-emerald-50/80') : ''
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                    done
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : isDark
                        ? 'border-gray-600 text-transparent'
                        : 'border-gray-300 text-transparent'
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <span>
                  <span className="block text-sm font-medium">{angle.label}</span>
                  <span className={`block text-xs ${hint}`}>{angle.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
