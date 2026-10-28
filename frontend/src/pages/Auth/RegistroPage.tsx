import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserPlus } from 'lucide-react';

export const RegistroPage: React.FC = () => {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nivelJuego, setNivelJuego] = useState('Intermedio');
  const [ladoPista, setLadoPista] = useState('Reves');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await registrar({
        nombre,
        email,
        password,
        nivelJuego,
        ladoPistaPreferido: ladoPista,
      });
      navigate(`/verificar-email?email=${encodeURIComponent(email)}`, {
        state: { devCode: res.devCode, message: res.message }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la cuenta. Verifique los datos.');
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
        minHeight: '75vh',
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
          gap: '20px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 900 }}>Crear Cuenta</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Unite a la comunidad de jugadores técnicos y gestioná tu equipamiento.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-300 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Nombre Completo / Apodo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Martín Di Nenno"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-field"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Nivel de Juego
              </label>
              <select
                value={nivelJuego}
                onChange={(e) => setNivelJuego(e.target.value)}
                className="input-field"
              >
                <option value="Iniciacion">Iniciación</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Competicion">Competición</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Lado Preferido
              </label>
              <select
                value={ladoPista}
                onChange={(e) => setLadoPista(e.target.value)}
                className="input-field"
              >
                <option value="Reves">Revés</option>
                <option value="Drive">Drive</option>
                <option value="Indistinto">Indistinto</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '10px' }}>
            <UserPlus size={16} />
            <span>{loading ? 'Creando cuenta...' : 'Registrarme'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary-sage)', fontWeight: 700 }}>
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
