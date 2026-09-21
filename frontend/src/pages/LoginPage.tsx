import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/store/authContext';
import { cn } from '@/utils/cn';

type Mode = 'login' | 'register';

const MIN_PASSWORD_LENGTH = 8;

function messageFor(cause: unknown, mode: Mode): string {
  if (!(cause instanceof ApiError)) return 'Algo ha fallado. Inténtalo de nuevo.';

  if (cause.status === 401) return 'Correo o contraseña incorrectos.';
  if (cause.status === 409) return 'Ya existe una cuenta con ese correo.';
  if (cause.status === 422) {
    return mode === 'register'
      ? `Revisa el correo y usa al menos ${MIN_PASSWORD_LENGTH} caracteres de contraseña.`
      : 'Revisa los datos introducidos.';
  }

  return cause.message;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isRegister && password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setError(null);
    setSending(true);

    try {
      await (isRegister ? register({ email, password }) : login({ email, password }));
      navigate('/dashboard', { replace: true });
    } catch (cause: unknown) {
      setError(messageFor(cause, mode));
    } finally {
      setSending(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setConfirm('');
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="text-ink mt-4 text-3xl font-semibold tracking-tight">Kaizen</h1>
          <p className="text-ink-muted mt-1.5 text-sm">Mejora continua, un registro cada día.</p>
        </div>

        {/* Alternador login / registro */}
        <div
          role="tablist"
          aria-label="Iniciar sesión o crear cuenta"
          className="border-line bg-surface mb-6 grid grid-cols-2 gap-1 rounded-xl border p-1"
        >
          {(['login', 'register'] as const).map((value) => (
            <button
              key={value}
              role="tab"
              type="button"
              aria-selected={mode === value}
              onClick={() => switchMode(value)}
              className={cn(
                'rounded-lg py-2 text-sm font-medium transition-colors duration-200',
                mode === value
                  ? 'bg-brand/18 text-brand-ink'
                  : 'text-ink-muted hover:text-ink-soft',
              )}
            >
              {value === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card border-line bg-surface/80 flex flex-col gap-4 border p-6 shadow-[0_8px_32px_-16px_rgb(0_0_0/0.8)] backdrop-blur-sm"
        >
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Contraseña"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder="••••••••"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...(isRegister && { hint: `Mínimo ${MIN_PASSWORD_LENGTH} caracteres.` })}
          />

          {isRegister && (
            <Input
              label="Repite la contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          {error !== null && (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" fullWidth disabled={sending} className="mt-1">
            {sending ? 'Un momento…' : isRegister ? 'Crear cuenta' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
