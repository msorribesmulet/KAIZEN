import { cn } from '@/utils/cn';

/**
 * Marca de Kaizen: un 改 estilizado en forma de flecha ascendente — la mejora
 * continua — dentro de un cuadrado redondeado con degradado azul.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn('size-9', className)}>
      <defs>
        <linearGradient id="kaizen-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5598e7" />
          <stop offset="100%" stopColor="#1c5cab" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#kaizen-logo)" />
      <path
        d="M11 26.5 17.5 19l4.5 4.5L29 14"
        fill="none"
        stroke="#eaf2fe"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29" cy="14" r="2.6" fill="#eaf2fe" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <div className="leading-none">
        <span className="text-ink text-lg font-semibold tracking-tight">Kaizen</span>
      </div>
    </div>
  );
}
