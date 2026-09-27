import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PropsTarjetaEstadistica {
  titulo: string;
  valor: number | string;
  icono: LucideIcon;
  color?: string;
  colorFondo?: string;
}

export const TarjetaEstadistica: React.FC<PropsTarjetaEstadistica> = ({
  titulo,
  valor,
  icono: Icono,
  color = '#6366f1',
  colorFondo = 'rgba(99, 102, 241, 0.15)'
}) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: colorFondo, color }}>
        <Icono size={26} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{valor}</div>
        <div className="stat-label">{titulo}</div>
      </div>
    </div>
  );
};
