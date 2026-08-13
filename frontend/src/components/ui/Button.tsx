import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-lg shadow-brand/25 hover:bg-brand-hover active:bg-brand-strong',
  secondary:
    'bg-surface-2 text-ink border border-line hover:bg-surface-3 hover:border-line-strong active:bg-surface-2',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink active:bg-surface-3',
  danger: 'bg-danger/12 text-danger border border-danger/30 hover:bg-danger/20 active:bg-danger/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-13 px-6 text-base gap-2',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-[background-color,border-color,color,transform,box-shadow] duration-150',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  );
}

/** Botón cuadrado para acciones con solo icono. Exige `aria-label`. */
export function IconButton({
  variant = 'ghost',
  className,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}: Omit<ButtonProps, 'size' | 'fullWidth'> & { 'aria-label': string }) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg',
        'transition-colors duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
