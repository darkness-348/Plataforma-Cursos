import React, { useState } from 'react';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { GraduationCap, LogIn, UserPlus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export const AutenticacionPage: React.FC = () => {
  const { iniciarSesion, registrarUsuario } = useAutenticacion();
  const [esLogin, setEsLogin] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  // Formulario Login
  const [correoLogin, setCorreoLogin] = useState<string>('admin@universidad.edu');
  const [claveLogin, setClaveLogin] = useState<string>('admin123');

  // Formulario Registro
  const [formRegistro, setFormRegistro] = useState({
    nombre_completo: '',
    correo: '',
    clave: '',
    rol: 'Estudiante',
    cedula_o_dni: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await iniciarSesion({ correo: correoLogin, clave: claveLogin });
    } catch (err: any) {
      setError(err.message || 'Error al autenticar credenciales.');
    } finally {
      setCargando(false);
    }
  };

  const handleRegistroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    setCargando(true);
    try {
      await registrarUsuario(formRegistro);
      setMensajeExito('¡Cuenta creada exitosamente! Ya puede iniciar sesión con sus credenciales.');
      setEsLogin(true);
      setCorreoLogin(formRegistro.correo);
      setClaveLogin(formRegistro.clave);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la cuenta de usuario.');
    } finally {
      setCargando(false);
    }
  };

  const cargarAccesoRapido = (correo: string, clave: string) => {
    setCorreoLogin(correo);
    setClaveLogin(clave);
    setEsLogin(true);
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.12) 0%, transparent 45%), #0b0f19'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '2.25rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>AcademiSys</h1>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            Sistema de Información Académica Universitaria
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(31, 41, 55, 0.7)',
          padding: '0.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => { setEsLogin(true); setError(null); }}
            style={{
              padding: '0.6rem',
              borderRadius: '9px',
              border: 'none',
              background: esLogin ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: esLogin ? 'white' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => { setEsLogin(false); setError(null); }}
            style={{
              padding: '0.6rem',
              borderRadius: '9px',
              border: 'none',
              background: !esLogin ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
              color: !esLogin ? 'white' : '#9ca3af',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {mensajeExito && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Login Form */}
        {esLogin ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>Correo Electrónico Institucional</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="ej. usuario@universidad.edu"
                value={correoLogin}
                onChange={(e) => setCorreoLogin(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="••••••••"
                value={claveLogin}
                onChange={(e) => setClaveLogin(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem' }}
            >
              <LogIn size={18} />
              <span>{cargando ? 'Autenticando...' : 'Iniciar Sesión'}</span>
            </button>

            {/* Quick Demo Access Buttons */}
            <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <p style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.75rem', textAlign: 'center' }}>
                Acceso Rápido de Prueba por Rol:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => cargarAccesoRapido('rector@universidad.edu', 'rector123')}
                  style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.4)', color: '#facc15', padding: '0.45rem 0.2rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  👑 Rector
                </button>
                <button
                  type="button"
                  onClick={() => cargarAccesoRapido('decano.sistemas@universidad.edu', 'decano123')}
                  style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#c084fc', padding: '0.45rem 0.2rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🏛️ Decano
                </button>
                <button
                  type="button"
                  onClick={() => cargarAccesoRapido('admin@universidad.edu', 'admin123')}
                  style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.45rem 0.2rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🔴 Admin
                </button>
                <button
                  type="button"
                  onClick={() => cargarAccesoRapido('carlos.mendoza@universidad.edu', 'docente123')}
                  style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.45rem 0.2rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🟢 Docente
                </button>
                <button
                  type="button"
                  onClick={() => cargarAccesoRapido('juan.rodriguez@estudiantes.edu', 'estudiante123')}
                  style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', padding: '0.45rem 0.2rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  🔵 Alumno
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegistroSubmit}>
            <div className="form-group">
              <label>Nombre Completo</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Ej. Juan Pérez Claros"
                value={formRegistro.nombre_completo}
                onChange={(e) => setFormRegistro({ ...formRegistro, nombre_completo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="ej. nuevo.usuario@estudiantes.edu"
                value={formRegistro.correo}
                onChange={(e) => setFormRegistro({ ...formRegistro, correo: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Mínimo 6 caracteres"
                  value={formRegistro.clave}
                  onChange={(e) => setFormRegistro({ ...formRegistro, clave: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Rol de Usuario</label>
                <select
                  className="form-control"
                  value={formRegistro.rol}
                  onChange={(e) => setFormRegistro({ ...formRegistro, rol: e.target.value })}
                >
                  <option value="Estudiante">Estudiante</option>
                  <option value="Docente">Docente</option>
                  <option value="Decano">Decano de Facultad</option>
                  <option value="Rector">Rector Magnífico</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Cédula de Identidad o DNI (Opcional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Para vincular expediente existente"
                value={formRegistro.cedula_o_dni}
                onChange={(e) => setFormRegistro({ ...formRegistro, cedula_o_dni: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem' }}
            >
              <UserPlus size={18} />
              <span>{cargando ? 'Procesando...' : 'Crear Cuenta'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
