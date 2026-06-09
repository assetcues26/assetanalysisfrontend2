import { useState } from 'react';
import { HistoryAssetCard } from './HistoryAssetCard';

export function HistoryGrid({ entries, onDelete }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div
      className={`grid w-full min-w-0 max-w-full gap-4 overflow-x-hidden sm:gap-6 ${
        expandedId
          ? 'grid-cols-1'
          : 'grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3'
      }`}
    >
      {entries.map((entry, index) => (
        <HistoryAssetCard
          key={entry.id}
          entry={entry}
          index={index}
          onDelete={onDelete}
          expanded={expandedId === entry.id}
          onToggleExpand={setExpandedId}
        />
      ))}
    </div>
  );
}
