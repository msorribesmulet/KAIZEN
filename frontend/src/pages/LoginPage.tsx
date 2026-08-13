import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

type Mode = 'login' | 'register';

/**
 * Inicio de sesión y registro. Solo UI: no hay autenticación real, al enviar
 * el formulario se navega directamente al resumen diario.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === 'register';

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isRegister && password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError(null);

    // TODO: conectar con API
    //   login    → POST /auth/login    body: { email, password }
    //   registro → POST /auth/register body: { email, password }
    // Guarda el token de la respuesta y solo entonces navega.
    navigate('/dashboard');
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...(isRegister && { hint: 'Mínimo 6 caracteres.' })}
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
              {...(error !== null && { error })}
            />
          )}

          <Button type="submit" size="lg" fullWidth className="mt-1">
            {isRegister ? 'Crear cuenta' : 'Entrar'}
          </Button>

          {!isRegister && (
            <button
              type="button"
              className="text-ink-muted hover:text-brand-ink text-center text-xs transition-colors"
            >
              ¿Has olvidado la contraseña?
            </button>
          )}
        </form>

        <p className="text-ink-muted mt-6 text-center text-xs">
          Demo sin autenticación real — cualquier dato te deja pasar.
        </p>
      </div>
    </div>
  );
}
