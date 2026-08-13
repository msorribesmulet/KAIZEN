import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const FIELD_BASE = cn(
  'w-full rounded-xl border border-line bg-surface-2 px-3.5 text-ink placeholder:text-ink-muted',
  'transition-colors duration-150',
  'hover:border-line-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/35',
  'disabled:opacity-50',
);

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  suffix?: ReactNode;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

/** Envoltorio común: etiqueta, ayuda y mensaje de error. */
function FieldShell({ label, hint, error, htmlFor, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-ink-soft text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-danger text-xs">{error}</p>
      ) : hint ? (
        <p className="text-ink-muted text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  /** Unidad mostrada dentro del campo, alineada a la derecha (ej. `g`, `kg`). */
  suffix?: string;
  containerClassName?: string;
}

export function Input({
  label,
  hint,
  error,
  suffix,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      htmlFor={inputId}
      {...(hint !== undefined && { hint })}
      {...(error !== undefined && { error })}
      {...(containerClassName !== undefined && { className: containerClassName })}
    >
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            FIELD_BASE,
            'h-11',
            suffix && 'pr-11',
            error && 'border-danger/60 focus:border-danger focus:ring-danger/30',
            className,
          )}
          {...props}
        />
        {suffix && (
          <span className="text-ink-muted pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm">
            {suffix}
          </span>
        )}
      </div>
    </FieldShell>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function Select({
  label,
  hint,
  error,
  className,
  containerClassName,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell
      label={label}
      htmlFor={selectId}
      {...(hint !== undefined && { hint })}
      {...(error !== undefined && { error })}
      {...(containerClassName !== undefined && { className: containerClassName })}
    >
      <div className="relative">
        <select
          id={selectId}
          className={cn(FIELD_BASE, 'h-11 cursor-pointer appearance-none pr-10', className)}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="text-ink-muted pointer-events-none absolute inset-y-0 right-3 my-auto size-4"
        >
          <path
            d="M6 8l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </FieldShell>
  );
}
