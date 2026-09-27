import React from 'react';
import { X } from 'lucide-react';

interface PropsVentanaModal {
  estaAbierto: boolean;
  alCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
}

export const VentanaModal: React.FC<PropsVentanaModal> = ({ estaAbierto, alCerrar, titulo, children }) => {
  if (!estaAbierto) return null;

  return (
    <div className="modal-overlay" onClick={alCerrar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button 
            onClick={alCerrar}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
