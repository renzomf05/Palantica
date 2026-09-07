import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/perfil');
    } catch (err: any) {
      setErrorMsg(err.message || 'Credenciales inválidas. Verifique su email y contraseña.');
    } finally {
      setLoading(false);
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
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>Iniciar Sesión</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Accedé a tu cuenta en Palantica para votar y armar tu paletero.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(224, 122, 95, 0.15)',
              border: '1px solid var(--color-accent-terracotta)',
              borderRadius: 'var(--radius-sm)',
              color: '#FFF',
              fontSize: '0.85rem',
            }}
          >
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
      </div>
    </div>
  );
};
