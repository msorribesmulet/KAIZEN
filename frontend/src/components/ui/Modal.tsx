import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './Button';
import { cn } from '@/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pie con las acciones (guardar, cancelar...). */
  footer?: ReactNode;
}

/**
 * Diálogo modal. En móvil aparece anclado abajo (hoja); en escritorio,
 * centrado. Cierra con Escape o pulsando fuera, y bloquea el scroll de fondo.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Lleva el foco al panel para que el lector de pantalla lo anuncie.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="bg-canvas/80 absolute inset-0 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'animate-rise relative flex max-h-[92dvh] w-full flex-col outline-none',
          'border-line bg-surface rounded-t-2xl border shadow-2xl shadow-black/60',
          'sm:max-w-lg sm:rounded-2xl',
        )}
      >
        <header className="border-line flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4">
          <h2 id={titleId} className="text-ink text-base font-semibold">
            {title}
          </h2>
          <IconButton aria-label="Cerrar" onClick={onClose}>
            <svg viewBox="0 0 20 20" className="size-4.5" aria-hidden="true">
              <path
                d="M5 5l10 10M15 5L5 15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <footer className="pb-safe border-line flex shrink-0 gap-3 border-t px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
