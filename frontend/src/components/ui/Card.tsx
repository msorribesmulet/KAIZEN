import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Título opcional en la cabecera de la tarjeta. */
  title?: string;
  /** Acción alineada a la derecha del título. */
  action?: ReactNode;
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-card border-line bg-surface/80 border backdrop-blur-sm',
        'shadow-[0_1px_0_0_rgb(255_255_255/0.04)_inset,0_8px_24px_-12px_rgb(0_0_0/0.6)]',
        className,
      )}
    >
      {(title || action) && (
        <header className="border-line flex items-center justify-between gap-3 border-b px-5 py-3.5">
          {title && <h2 className="text-ink text-sm font-semibold tracking-wide">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/** Estado vacío coherente para listas sin contenido. */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {icon && <div className="text-ink-muted mb-1">{icon}</div>}
      <p className="text-ink-soft font-medium">{title}</p>
      {description && <p className="text-ink-muted max-w-xs text-sm">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
