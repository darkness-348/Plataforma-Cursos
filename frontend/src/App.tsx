import React, { useState } from 'react';
import { ProveedorAutenticacion, useAutenticacion } from './context/ContextoAutenticacion';
import { MenuLateral } from './components/MenuLateral';
import { BarraNavegacion } from './components/BarraNavegacion';
import { AutenticacionPage } from './pages/AutenticacionPage';
import { PanelPrincipalPage } from './pages/PanelPrincipalPage';
import { CarrerasPage } from './pages/CarrerasPage';
import { EstudiantesPage } from './pages/EstudiantesPage';
import { DocentesPage } from './pages/DocentesPage';
import { AsignaturasPage } from './pages/AsignaturasPage';
import { MatriculasPage } from './pages/MatriculasPage';
import { ReportesDecanatoPage } from './pages/ReportesDecanatoPage';
import { AulasPage } from './pages/AulasPage';

const AplicacionPrincipal: React.FC = () => {
  const { usuario, token, cargando } = useAutenticacion();
  const [pestanaActiva, setPestanaActiva] = useState<string>('panel');

  if (cargando) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#9ca3af'
      }}>
        Cargando sesión de usuario y permisos...
      </div>
    );
  }

  // Si no hay token ni usuario autenticado, mostrar formulario de inicio de sesión / registro
  if (!token || !usuario) {
    return <AutenticacionPage />;
  }

  const obtenerTitulo = (): string => {
    switch (pestanaActiva) {
      case 'panel': return 'Panel Principal - Sistema Académico Universitario';
      case 'reportes_decanato': return 'Reportes Ejecutivos & Estadísticas de Decanato';
      case 'carreras': return 'Gestión de Carreras Universitarias';
      case 'aulas': return 'Gestión de Aulas & Capacidad Física Institucional';
      case 'estudiantes': return 'Expediente y Gestión de Estudiantes';
      case 'docentes': return 'Nómina de Docentes Académicos';
      case 'asignaturas': return 'Gestión de Asignaturas & Aulas';
      case 'matriculas': return 'Control de Matrículas & Calificaciones';
      default: return 'Sistema de Información Académico';
    }
  };

  const renderizarContenido = () => {
    switch (pestanaActiva) {
      case 'panel': return <PanelPrincipalPage />;
      case 'reportes_decanato': return <ReportesDecanatoPage />;
      case 'carreras': return <CarrerasPage />;
      case 'aulas': return <AulasPage />;
      case 'estudiantes': return <EstudiantesPage />;
      case 'docentes': return <DocentesPage />;
      case 'asignaturas': return <AsignaturasPage />;
      case 'matriculas': return <MatriculasPage />;
      default: return <PanelPrincipalPage />;
    }
  };

  return (
    <div className="app-container">
      <MenuLateral pestanaActiva={pestanaActiva} setPestanaActiva={setPestanaActiva} />
      <div className="main-wrapper">
        <BarraNavegacion titulo={obtenerTitulo()} />
        <main className="content-body">
          {renderizarContenido()}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ProveedorAutenticacion>
      <AplicacionPrincipal />
    </ProveedorAutenticacion>
  );
};

export default App;
