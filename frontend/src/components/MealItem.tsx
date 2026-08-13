import type { LogEntry } from '@/types';
import { formatGrams, formatNumber } from '@/utils/format';
import { MACRO_COLORS } from '@/utils/macros';
import { IconButton } from './ui/Button';
import { TrashIcon } from './icons';

interface MealItemProps {
  entry: LogEntry;
  onDelete: (logId: number) => void;
}

/** Una comida registrada: alimento, gramos, calorías y sus tres macros. */
export function MealItem({ entry, onDelete }: MealItemProps) {
  const { log, food, cal, protein, carbs, fat } = entry;

  const macros = [
    { key: 'protein' as const, short: 'P', value: protein },
    { key: 'carbs' as const, short: 'C', value: carbs },
    { key: 'fat' as const, short: 'G', value: fat },
  ];

  return (
    <li className="group hover:bg-surface-2/60 flex items-center gap-3 px-5 py-3.5 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-ink truncate text-sm font-medium">{food.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-ink-muted text-xs tabular-nums">{formatGrams(log.grams)}</span>
          {macros.map(({ key, short, value }) => (
            <span key={key} className="text-ink-muted flex items-center gap-1 text-xs tabular-nums">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full"
                style={{ backgroundColor: MACRO_COLORS[key] }}
              />
              {short} {formatNumber(value, value < 10 ? 1 : 0)}
            </span>
          ))}
        </div>
      </div>

      <span className="text-ink shrink-0 text-sm font-semibold tabular-nums">
        {formatNumber(cal)}
        <span className="text-ink-muted ml-1 text-xs font-normal">kcal</span>
      </span>

      <IconButton
        aria-label={`Eliminar ${food.name}`}
        onClick={() => onDelete(log.id)}
        className="text-ink-muted hover:bg-danger/12 hover:text-danger opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
      >
        <TrashIcon className="size-4.5" />
      </IconButton>
    </li>
  );
}
