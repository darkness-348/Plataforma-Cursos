import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { ReporteDecanato, CarreraReporte } from '../types';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { TarjetaEstadistica } from '../components/TarjetaEstadistica';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Award, 
  BarChart2, 
  Printer, 
  Search, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Percent,
  FileSpreadsheet
} from 'lucide-react';

export const ReportesDecanatoPage: React.FC = () => {
  const { usuario } = useAutenticacion();
  const [reporte, setReporte] = useState<ReporteDecanato | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [facultadFiltro, setFacultadFiltro] = useState<string>('Todas');
  const [error, setError] = useState<string | null>(null);

  const cargarReporte = async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await clienteApi.obtenerReporteDecanato();
      setReporte(datos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los reportes institucionales de decanato.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const imprimirReporte = () => {
    window.print();
  };

  const exportarCSV = () => {
    if (!reporte) return;
    const encabezados = ['Codigo', 'Carrera', 'Facultad', 'Total Estudiantes', 'Estudiantes Activos', 'Promedio Carrera', 'Tasa Aprobacion (%)'];
    const filas = reporte.reporte_carreras.map(c => [
      `"${c.codigo}"`,
      `"${c.nombre}"`,
      `"${c.facultad}"`,
      c.total_estudiantes,
      c.estudiantes_activos,
      c.promedio_carrera,
      `${c.tasa_aprobacion}%`
    ]);

    const contenidoCSV = 'data:text/csv;charset=utf-8,' + [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const encodedUri = encodeURI(contenidoCSV);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Estudiantes_Carrera_Decanato_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const facultadesDisponibles = reporte 
    ? Array.from(new Set(reporte.reporte_carreras.map(c => c.facultad))) 
    : [];

  const carrerasFiltradas = reporte?.reporte_carreras.filter(c => {
    const coincideBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                             c.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideFacultad = facultadFiltro === 'Todas' || c.facultad === facultadFiltro;
    return coincideBusqueda && coincideFacultad;
  }) || [];

  const totalEstudiantesInstitucional = reporte?.resumen_institucional.total_estudiantes || 0;

  return (
    <div className="reportes-container">
      {/* Header institucional */}
      <div className="section-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 color="#818cf8" size={28} />
            Reporte Ejecutivo de Decanato & Rectoría
          </h2>
          <p style={{ color: '#9ca3af', margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>
            Estadísticas institucionales detalladas por carrera universitaria, ocupación y matrícula de estudiantes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={exportarCSV} disabled={cargando || !reporte}>
            <FileSpreadsheet size={16} /> Exportar CSV
          </button>
          <button className="btn btn-primary" onClick={imprimirReporte} disabled={cargando || !reporte}>
            <Printer size={16} /> Imprimir Reporte
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Tarjetas resumen institucional */}
      {reporte && (
        <div className="metrics-grid" style={{ marginBottom: '2rem' }}>
          <TarjetaEstadistica
            titulo="Estudiantes Totales"
            valor={reporte.resumen_institucional.total_estudiantes}
            icono={Users}
            color="#818cf8"
            colorFondo="rgba(99, 102, 241, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Oferta de Carreras"
            valor={reporte.resumen_institucional.total_carreras}
            icono={GraduationCap}
            color="#c084fc"
            colorFondo="rgba(168, 85, 247, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Promedio General"
            valor={`${reporte.resumen_institucional.promedio_institucional} pts`}
            icono={Award}
            color="#fbbf24"
            colorFondo="rgba(245, 158, 11, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Materias Dictadas"
            valor={reporte.resumen_institucional.total_asignaturas}
            icono={BookOpen}
            color="#34d399"
            colorFondo="rgba(16, 185, 129, 0.15)"
          />
        </div>
      )}

      {/* Controles de Filtros */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por código o nombre de carrera..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>Filtrar Facultad:</label>
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: '220px' }}
            value={facultadFiltro}
            onChange={(e) => setFacultadFiltro(e.target.value)}
          >
            <option value="Todas">Todas las Facultades</option>
            {facultadesDisponibles.map((fac) => (
              <option key={fac} value={fac}>{fac}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Desglose: Estudiantes por Carrera */}
      <div className="table-container">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} color="#6366f1" />
            ¿Cuántos Estudiantes hay en cada Carrera? (Desglose por Decanato)
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
            Mostrando {carrerasFiltradas.length} carreras académicas
          </span>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Carrera Universitaria</th>
              <th>Facultad Perteneciente</th>
              <th>Cantidad de Estudiantes</th>
              <th>Distribución sobre Total</th>
              <th>Promedio Carrera</th>
              <th>Tasa Aprobación</th>
              <th style={{ textAlign: 'right' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem' }}>Generando reporte de decanato...</td>
              </tr>
            ) : carrerasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                  No se encontraron carreras con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              carrerasFiltradas.map((carrera: CarreraReporte) => {
                const porcentajeTotal = totalEstudiantesInstitucional > 0 
                  ? ((carrera.total_estudiantes / totalEstudiantesInstitucional) * 100).toFixed(1)
                  : '0.0';

                return (
                  <tr key={carrera.carrera_id}>
                    <td><code>{carrera.codigo}</code></td>
                    <td style={{ fontWeight: 600, color: '#f3f4f6' }}>{carrera.nombre}</td>
                    <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{carrera.facultad}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', fontWeight: 700 }}>
                          <Users size={13} style={{ marginRight: 4 }} />
                          {carrera.total_estudiantes} Estudiantes
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#10b981' }}>
                          ({carrera.estudiantes_activos} activos)
                        </span>
                      </div>
                    </td>
                    <td style={{ width: '180px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#9ca3af' }}>
                          <span>Proporción</span>
                          <span style={{ fontWeight: 600, color: '#818cf8' }}>{porcentajeTotal}%</span>
                        </div>
                        <div style={{ background: '#1f2937', height: '7px', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${porcentajeTotal}%`,
                              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                              height: '100%',
                              borderRadius: '4px'
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: carrera.promedio_carrera >= 85 ? '#34d399' : '#fbbf24' }}>
                        {carrera.promedio_carrera} pts
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-aprobado">
                        <TrendingUp size={12} style={{ marginRight: 3 }} />
                        {carrera.tasa_aprobacion}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="badge badge-active">Activa</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
