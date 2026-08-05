import React, { useMemo } from 'react';
import { Recipe } from '../../types';

interface CooksRowProps {
  recipes: Recipe[];
  selectedAuthor: string | null;
  onAuthorClick: (author: string | null) => void;
}

// Warm dot colors rotated per cook — stable by list position
const DOT_COLORS = ['#f5c542', '#f0a68c', '#a8c8e8', '#b8d8b8', '#e8c8e0', '#d8c8a8'];

const CooksRow: React.FC<CooksRowProps> = ({ recipes, selectedAuthor, onAuthorClick }) => {
  const cooks = useMemo(() => {
    const counts = new Map<string, number>();
    recipes.forEach(r => {
      if (r.author) counts.set(r.author, (counts.get(r.author) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [recipes]);

  if (cooks.length < 2) return null;

  const visible = cooks.slice(0, 5);
  const extra = cooks.length - visible.length;

  return (
    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap py-2">
      <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-muted-foreground mr-1">
        From the kitchens of
      </span>
      {visible.map(([name], i) => {
        const active = selectedAuthor === name;
        return (
          <button
            key={name}
            onClick={() => onAuthorClick(active ? null : name)}
            className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-sm font-bold border transition-all hover:-translate-y-0.5 hover:-rotate-1 hover:shadow-md ${
              active
                ? 'bg-foreground text-background border-foreground shadow-md'
                : 'bg-card text-foreground border-border shadow-sm'
            }`}
          >
            <span
              className="w-6 h-6 rounded-full grid place-items-center font-serif text-xs font-bold text-[#1d2a44]"
              style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
            >
              {name.charAt(0)}
            </span>
            {name}
          </button>
        );
      })}
      {extra > 0 && (
        <span className="text-sm font-bold text-muted-foreground px-2">+ {extra} more</span>
      )}
    </div>
  );
};

export default CooksRow;
