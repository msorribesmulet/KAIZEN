import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo, LogoMark } from '@/components/Logo';
import { HomeIcon, ListIcon, LogoutIcon, PlusIcon, UserIcon } from '@/components/icons';
import { useAuth } from '@/store/authContext';
import { cn } from '@/utils/cn';
import type { ComponentType, SVGProps } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Resumen', icon: HomeIcon },
  { to: '/registrar', label: 'Registrar', icon: PlusIcon },
  { to: '/alimentos', label: 'Alimentos', icon: ListIcon },
  { to: '/perfil', label: 'Perfil', icon: UserIcon },
];

/**
 * Estructura de la app: barra inferior en móvil, barra lateral fija en
 * escritorio. El contenido se centra con un ancho máximo para que en pantallas
 * grandes no se estire sin control.
 */
export function AppLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-dvh lg:flex">
      {/* ---------- Barra lateral (escritorio) ---------- */}
      <aside className="border-line bg-surface/50 sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r px-4 py-6 backdrop-blur-sm lg:flex">
        <Logo className="px-2" />

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  'transition-colors duration-150',
                  isActive
                    ? 'bg-brand/15 text-brand-ink'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('size-5 transition-colors', isActive && 'text-brand')} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="text-ink-muted hover:bg-surface-2 hover:text-ink flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <LogoutIcon className="size-5" />
          Cerrar sesión
        </button>
      </aside>

      {/* ---------- Contenido ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabecera móvil */}
        <header className="border-line bg-canvas/85 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="text-ink text-base font-semibold tracking-tight">Kaizen</span>
          </div>
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={() => void handleLogout()}
            className="text-ink-muted hover:bg-surface-2 hover:text-ink rounded-lg p-2 transition-colors"
          >
            <LogoutIcon className="size-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* ---------- Barra inferior (móvil) ---------- */}
      <nav
        aria-label="Navegación principal"
        className="pb-safe border-line bg-surface/90 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md lg:hidden"
        style={{ ['--pb-safe-extra' as string]: '0.25rem' }}
      >
        <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium',
                    'transition-colors duration-150',
                    isActive ? 'text-brand' : 'text-ink-muted active:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200',
                        isActive && 'bg-brand/15',
                      )}
                    >
                      <Icon className="size-5" />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
