import React from 'react';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { Database, ShieldCheck, User } from 'lucide-react';

interface PropsBarraNavegacion {
  titulo: string;
}

export const BarraNavegacion: React.FC<PropsBarraNavegacion> = ({ titulo }) => {
  const { usuario } = useAutenticacion();

  return (
    <header className="top-header">
      <div className="header-title">
        <h1>{titulo}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {usuario && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(31, 41, 55, 0.6)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem'
          }}>
            <User size={15} style={{ color: '#a5b4fc' }} />
            <span style={{ fontWeight: 600 }}>{usuario.nombre_completo}</span>
            <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}>({usuario.rol})</span>
          </div>
        )}

        <div className="header-status">
          <div className="status-dot"></div>
          <span>JWT Bearer Conectado</span>
        </div>
      </div>
    </header>
  );
};
