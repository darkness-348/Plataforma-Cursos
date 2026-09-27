import React from 'react';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileCheck,
  Building2,
  Building,
  LogOut,
  BarChart3
} from 'lucide-react';

interface PropsMenuLateral {
  pestanaActiva: string;
  setPestanaActiva: (pestana: string) => void;
}

export const MenuLateral: React.FC<PropsMenuLateral> = ({ pestanaActiva, setPestanaActiva }) => {
  const { usuario, cerrarSesion } = useAutenticacion();

  const elementosMenu = [
    { id: 'panel', etiqueta: 'Panel Principal', icono: LayoutDashboard, roles: ['Rector', 'Decano', 'Administrador', 'Docente', 'Estudiante'] },
    { id: 'reportes_decanato', etiqueta: 'Reportes Decanato', icono: BarChart3, roles: ['Rector', 'Decano', 'Administrador'] },
    { id: 'carreras', etiqueta: 'Carreras', icono: Building2, roles: ['Rector', 'Decano', 'Administrador'] },
    { id: 'aulas', etiqueta: 'Aulas & Capacidad', icono: Building, roles: ['Rector', 'Decano', 'Administrador', 'Docente'] },
    { id: 'estudiantes', etiqueta: 'Estudiantes', icono: Users, roles: ['Rector', 'Decano', 'Administrador', 'Docente'] },
    { id: 'docentes', etiqueta: 'Docentes', icono: GraduationCap, roles: ['Rector', 'Decano', 'Administrador'] },
    { id: 'asignaturas', etiqueta: 'Asignaturas', icono: BookOpen, roles: ['Rector', 'Decano', 'Administrador', 'Docente', 'Estudiante'] },
    { id: 'matriculas', etiqueta: 'Matrículas & Notas', icono: FileCheck, roles: ['Rector', 'Decano', 'Administrador', 'Docente', 'Estudiante'] },
  ];

  const menuFiltrado = elementosMenu.filter(item => usuario && item.roles.includes(usuario.rol));

  const obtenerInsigniaRol = (rol: string) => {
    switch (rol) {
      case 'Rector':
        return { label: '👑 Rector', bg: 'rgba(234, 179, 8, 0.15)', color: '#facc15', border: 'rgba(234, 179, 8, 0.4)' };
      case 'Decano':
        return { label: '🏛️ Decano', bg: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
      case 'Administrador':
        return { label: 'Admin', bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Docente':
        return { label: 'Docente', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { label: 'Estudiante', bg: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', border: 'rgba(99, 102, 241, 0.3)' };
    }
  };

  const rolBadge = usuario ? obtenerInsigniaRol(usuario.rol) : null;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <div className="brand-title">AcademiSys</div>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Sistema Académico Completo</span>
        </div>
      </div>

      <ul className="nav-menu">
        {menuFiltrado.map((item) => {
          const Icono = item.icono;
          const estaActivo = pestanaActiva === item.id;
          return (
            <li key={item.id} className={`nav-item ${estaActivo ? 'active' : ''}`}>
              <button onClick={() => setPestanaActiva(item.id)}>
                <Icono size={19} />
                <span>{item.etiqueta}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {usuario && (
        <div style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {usuario.nombre_completo}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {usuario.correo}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {rolBadge && (
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '8px',
                background: rolBadge.bg,
                color: rolBadge.color,
                border: `1px solid ${rolBadge.border}`
              }}>
                {rolBadge.label}
              </span>
            )}

            <button
              onClick={cerrarSesion}
              title="Cerrar Sesión"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
