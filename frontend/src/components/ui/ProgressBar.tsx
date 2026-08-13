import { cn } from '@/utils/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  /** Color de la barra. Por defecto, el azul de marca. */
  color?: string;
  className?: string;
  'aria-label': string;
}

/**
 * Barra de progreso fina. Al pasarse del máximo, el excedente se pinta en
 * rojo sobre la barra llena para que el desvío se vea sin leer el número.
 */
export function ProgressBar({
  value,
  max,
  color = 'var(--color-brand)',
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const ratio = max > 0 ? value / max : 0;
  const filled = Math.min(1, Math.max(0, ratio));
  const overflow = Math.min(1, Math.max(0, ratio - 1));

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      className={cn('bg-surface-3 h-2 w-full overflow-hidden rounded-full', className)}
    >
      <div className="relative h-full">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${filled * 100}%`, backgroundColor: color }}
        />
        {overflow > 0 && (
          <div
            className="bg-danger absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${overflow * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}
