import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import { LogIn, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, saveAuthSession } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado para flujo de 2FA
  const [is2FAStage, setIs2FAStage] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading2FA, setLoading2FA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(email, password);

      // Si el usuario requiere 2FA
      if (res && res.requires2FA && res.tempToken) {
        setTempToken(res.tempToken);
        setIs2FAStage(true);
        setLoading(false);
        return;
      }

      navigate('/perfil');
    } catch (err: any) {
      if (err.requiresVerification || err.status === 403 || err.message?.includes('verificar')) {
        // Redirigir a verificación de email
        navigate(`/verificar-email?email=${encodeURIComponent(email)}`, {
          state: {
            message: err.message || err.error || 'Debes verificar tu correo antes de iniciar sesión.',
            devCode: err.devCode
          }
        });
        return;
      }

      if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setErrorMsg('Credenciales inválidas. Verifique su correo electrónico y contraseña.');
      } else if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setErrorMsg('No se pudo conectar con el servidor. Reintentá en unos segundos.');
      } else {
        setErrorMsg(err.message || 'Error al iniciar sesión. Inténtelo nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading2FA(true);

    try {
      const authResponse = await authApi.verificar2FALogin(tempToken, twoFactorCode.trim());
      saveAuthSession(authResponse);
      navigate('/perfil');
    } catch (err: any) {
      setErrorMsg(err.message || err.error || 'Código 2FA incorrecto o expirado.');
    } finally {
      setLoading2FA(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
      }}
      className="animate-fade-in"
    >
      <div
        className="card-skeuomorphic"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {is2FAStage ? (
          // ==============================
          // PANTALLA PASO 2: CÓDIGO 2FA
          // ==============================
          <>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(163, 230, 53, 0.15)',
                  color: 'var(--color-primary-sage)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  border: '1px solid rgba(163, 230, 53, 0.3)',
                }}
              >
                <ShieldCheck size={28} />
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900 }}>Autenticación en 2 Pasos</h1>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Ingresá el código de 6 dígitos generado por tu aplicación autenticadora.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Código de Seguridad (6 dígitos)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    placeholder="000000"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="input-field"
                    style={{
                      letterSpacing: '0.4em',
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                    }}
                  />
                  <KeyRound
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading2FA || twoFactorCode.length !== 6}
                className="btn-primary"
                style={{ marginTop: '8px' }}
              >
                <ShieldCheck size={16} />
                <span>{loading2FA ? 'Verificando código...' : 'Confirmar & Entrar'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIs2FAStage(false);
                  setTwoFactorCode('');
                  setErrorMsg(null);
                }}
                className="btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.84rem',
                }}
              >
                <ArrowLeft size={14} />
                <span>Volver a iniciar sesión</span>
              </button>
            </form>
          </>
        ) : (
          // ==============================
          // PANTALLA NORMAL: EMAIL & PASSWORD
          // ==============================
          <>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>Iniciar Sesión</h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Accedé a tu cuenta en Palantica para votar y armar tu paletero.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="jugador@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px' }}>
                <LogIn size={16} />
                <span>{loading ? 'Verificando...' : 'Entrar'}</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ¿No tenés cuenta aún?{' '}
                <Link to="/registro" style={{ color: 'var(--color-primary-sage)', fontWeight: 700 }}>
                  Registrate gratis
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
