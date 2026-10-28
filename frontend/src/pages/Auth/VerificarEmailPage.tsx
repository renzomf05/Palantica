import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import { Mail, CheckCircle2, RefreshCw, ArrowLeft, KeyRound } from 'lucide-react';

export const VerificarEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { saveAuthSession } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);

  // Estados del código de 6 dígitos
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    (location.state as any)?.message || null
  );

  // Dev code si está disponible en location.state
  const [devCode, setDevCode] = useState<string | null>(
    (location.state as any)?.devCode || null
  );

  // Temporizador de 15 minutos (900 segundos) y cooldown de reenvío (60 segundos)
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [resendCooldown, setResendCooldown] = useState<number>(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Si devCode viene de inicio, lo pre-cargamos para conveniencia en testing
  useEffect(() => {
    if (devCode && devCode.length === 6 && digits.every(d => d === '')) {
      const codeDigits = devCode.split('');
      setDigits(codeDigits);
    }
  }, [devCode]);

  // Manejo de cambio en cada casillero
  const handleDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, '');
    
    // Si pegan los 6 dígitos juntos
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((d, i) => {
        newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setDigits(newDigits);

    // Auto-focus al siguiente input si se ingresó dígito
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejo de tecla Retroceso (Backspace)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullCode = digits.join('');

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullCode.length !== 6 || !email) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const authResponse = await authApi.verificarCodigo(email, fullCode);
      saveAuthSession(authResponse);
      navigate('/perfil');
    } catch (err: any) {
      setErrorMsg(err.message || err.error || 'Código de seguridad inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email || resending) return;

    setErrorMsg(null);
    setResending(true);

    try {
      const res = await authApi.reenviarCodigo(email);
      setSuccessMsg('Nuevo código de seguridad enviado.');
      if (res.devCode) {
        setDevCode(res.devCode);
        setDigits(res.devCode.split(''));
      }
      setResendCooldown(60);
      setTimeLeft(900);
    } catch (err: any) {
      setErrorMsg(err.message || err.error || 'No se pudo reenviar el código.');
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        padding: '20px 16px',
      }}
      className="animate-fade-in"
    >
      <div
        className="card-skeuomorphic"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
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
            <Mail size={28} />
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>Confirmá tu Correo</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Ingresá el código de 6 dígitos que enviamos a:
          </p>
          <strong style={{ fontSize: '0.94rem', color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
            {email || 'tu email registrado'}
          </strong>
        </div>

        {/* Mensaje de desarrollo con devCode para testing inmediato */}
        {devCode && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(37, 99, 235, 0.12)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              color: 'var(--padel-court-blue-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Código de prueba: <strong>{devCode}</strong></span>
            <button
              type="button"
              onClick={() => setDigits(devCode.split(''))}
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--padel-court-blue-light)',
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Autocompletar
            </button>
          </div>
        )}

        {successMsg && !errorMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-300 text-xs font-semibold leading-relaxed flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!email && (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Tu Correo Electrónico
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
          )}

          {/* 6 Casilleros de dígitos estilo OTP */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '10px', textAlign: 'center' }}>
              Código de Seguridad (6 dígitos)
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
              }}
            >
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  autoFocus={idx === 0}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  style={{
                    width: '100%',
                    height: '52px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: digit ? '2px solid var(--color-primary-sage)' : '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Validez: <strong style={{ color: timeLeft < 120 ? '#ef4444' : 'inherit' }}>{formatTimer(timeLeft)}</strong>
            </span>
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResend}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--color-primary-sage)',
                cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: '0.78rem',
              }}
            >
              <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
              <span>
                {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || fullCode.length !== 6 || !email}
            className="btn-primary"
            style={{ marginTop: '6px' }}
          >
            <KeyRound size={16} />
            <span>{loading ? 'Confirmando...' : 'Confirmar & Ingresar'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={14} />
            <span>Volver al inicio de sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
