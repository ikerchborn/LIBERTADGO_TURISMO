import React, { useState, useEffect } from 'react';
import { useAuth, AuthUser } from '../context/AuthContext.tsx';
import { Shield, Lock, Mail, User, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { RiyMoLogo } from '../components/common/RiyMoLogo.tsx';

interface LoginPageProps {
  onBackToApp: () => void;
  onLoginSuccess: (user?: AuthUser) => void;
  initialMode?: 'login' | 'register';
  portalType?: 'public' | 'admin';
  onModeChange?: (mode: 'login' | 'register') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBackToApp,
  onLoginSuccess,
  initialMode = 'login',
  portalType = 'public',
  onModeChange,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(
    portalType === 'admin' ? 'login' : initialMode
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(portalType === 'admin' ? 'login' : initialMode);
    setError(null);
  }, [initialMode, portalType]);

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setError(null);
    onModeChange?.(nextMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (name.trim().length < 2) {
        setError('Ingresa tu nombre (al menos 2 caracteres).');
        return;
      }
      if (!email.trim()) {
        setError('Por favor ingresa tu correo electrónico.');
        return;
      }
      if (password.trim().length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await register(name.trim(), email.trim(), password);
        if (res.success) {
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'No se pudo completar el registro.');
        }
      } catch {
        setError('Error al crear tu cuenta. Intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Credenciales inválidas');
      }
    } catch {
      setError('Error al procesar el inicio de sesión. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (portalType === 'admin') {
    return (
      <div className="min-h-dvh flex flex-col bg-[#0F172A] text-white">
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToApp}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a RiyMo</span>
          </button>

          <div className="flex items-center gap-2">
            <RiyMoLogo variant="full" theme="dark" size="sm" showSubtitle={false} />
            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              ADMIN PORTAL
            </span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#E85B49]/15 border border-[#E85B49]/30 text-[#E85B49] flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Panel de Administración
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Gestión centralizada del catálogo turístico de La Libertad
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@riymo.pe"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 bg-[#E85B49] hover:bg-[#d64f3e] disabled:opacity-60 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{isSubmitting ? 'Iniciando sesión...' : 'Ingresar al Panel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </main>

        <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
          RIYMO — Exploración y Planificación Turística del Perú
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-white text-[#263B35]">
      <header className="h-16 border-b border-[#E9E7E1] px-4 sm:px-8 flex items-center justify-between bg-white shrink-0">
        <button
          type="button"
          onClick={onBackToApp}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#263B35] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <button
          type="button"
          onClick={onBackToApp}
          className="cursor-pointer focus:outline-none"
          aria-label="RIYMO"
        >
          <RiyMoLogo variant="full" theme="light" size="md" showSubtitle={false} />
        </button>

        <div className="w-24 sm:w-28" aria-hidden="true" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 bg-[#F7F2E8]/35">
        <div className="w-full max-w-md bg-white border border-[#E9E7E1] rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* Selector de pestañas Login / Registro */}
          <div className="grid grid-cols-2 p-1 bg-[#F7F2E8] rounded-lg border border-[#E9E7E1] mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#263B35] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#263B35] shadow-2xs'
                  : 'text-[#64748B] hover:text-[#263B35]'
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#263B35] tracking-tight">
              {mode === 'login' ? 'Bienvenido de vuelta a RiyMo' : 'Crea tu cuenta en RiyMo'}
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              {mode === 'login'
                ? 'Accede con tu correo para continuar planificando tus rutas por La Libertad.'
                : 'Regístrate para organizar itinerarios y gestionar tus viajes.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-semibold text-[#263B35] mb-1.5"
                >
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Valeria Paredes"
                    required
                    minLength={2}
                    className="w-full bg-white border border-[#E9E7E1] rounded-lg pl-9 pr-3.5 py-2 text-sm text-[#263B35] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49]"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-semibold text-[#263B35] mb-1.5"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full bg-white border border-[#E9E7E1] rounded-lg pl-9 pr-3.5 py-2 text-sm text-[#263B35] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold text-[#263B35] mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••••••'}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  className="w-full bg-white border border-[#E9E7E1] rounded-lg pl-9 pr-3.5 py-2 text-sm text-[#263B35] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#E85B49] focus:ring-1 focus:ring-[#E85B49]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-[#E85B49] hover:bg-[#D94C3C] disabled:opacity-60 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {isSubmitting
                  ? mode === 'register'
                    ? 'Creando cuenta...'
                    : 'Iniciando sesión...'
                  : mode === 'register'
                  ? 'Crear cuenta'
                  : 'Iniciar sesión'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <footer className="py-4 border-t border-[#E9E7E1] bg-white text-center text-xs text-[#64748B]">
        RIYMO · Planificación turística en La Libertad, Perú
      </footer>
    </div>
  );
};
