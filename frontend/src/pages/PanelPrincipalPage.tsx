import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { ResumenPanel, Matricula, Asignatura, Estudiante, Docente } from '../types';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { TarjetaEstadistica } from '../components/TarjetaEstadistica';
import { VentanaModal } from '../components/VentanaModal';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileCheck, 
  Building2, 
  RefreshCw, 
  Award, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export const PanelPrincipalPage: React.FC = () => {
  const { usuario } = useAutenticacion();
  
  // Estado para Administrador / Rector / Decano
  const [datosAdmin, setDatosAdmin] = useState<ResumenPanel | null>(null);
  
  // Estado para Estudiante
  const [misMatriculas, setMisMatriculas] = useState<Matricula[]>([]);
  const [misAsignaturasDisponibles, setMisAsignaturasDisponibles] = useState<Asignatura[]>([]);
  const [perfilEstudiante, setPerfilEstudiante] = useState<Estudiante | null>(null);

  // Estado para Docente
  const [perfilDocente, setPerfilDocente] = useState<Docente | null>(null);
  const [misAsignaturasDocente, setMisAsignaturasDocente] = useState<Asignatura[]>([]);
  const [misMatriculasDocente, setMisMatriculasDocente] = useState<Matricula[]>([]);
  const [modalNotasAbierto, setModalNotasAbierto] = useState<boolean>(false);
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState<Matricula | null>(null);
  const [formularioNotas, setFormularioNotas] = useState({
    estado: 'Inscrito',
    nota_primer_parcial: '',
    nota_segundo_parcial: '',
    nota_examen_final: ''
  });

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const esEstudiante = usuario?.rol === 'Estudiante';
  const esDocente = usuario?.rol === 'Docente';
  const esAdminORectorODecano = !esEstudiante && !esDocente;

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      if (esEstudiante) {
        let est: Estudiante | null = null;
        if (usuario?.estudiante_id) {
          try {
            est = await clienteApi.obtenerEstudiantePorId(usuario.estudiante_id);
            setPerfilEstudiante(est);
          } catch (e) {
            console.error('Error al cargar perfil de estudiante:', e);
          }
        }

        const paramsAsig: Record<string, string> = {};
        if (est?.carrera_id) {
          paramsAsig.carrera_id = String(est.carrera_id);
        }

        const [listaMatriculas, listaAsignaturas] = await Promise.all([
          usuario?.estudiante_id ? clienteApi.obtenerMatriculas({ estudiante_id: String(usuario.estudiante_id) }) : Promise.resolve([]),
          clienteApi.obtenerAsignaturas(paramsAsig)
        ]);

        setMisMatriculas(listaMatriculas);
        setMisAsignaturasDisponibles(listaAsignaturas);
      } else if (esDocente) {
        let doc: Docente | null = null;
        if (usuario?.docente_id) {
          try {
            doc = await clienteApi.obtenerDocentePorId(usuario.docente_id);
            setPerfilDocente(doc);
          } catch (e) {
            console.error('Error al cargar perfil de docente:', e);
          }
        }

        const [listaAsignaturas, listaMatriculas] = await Promise.all([
          clienteApi.obtenerAsignaturas({ docente_id: usuario?.docente_id ? String(usuario.docente_id) : '' }),
          clienteApi.obtenerMatriculas()
        ]);

        setMisAsignaturasDocente(listaAsignaturas);
        const idsAsigDoc = listaAsignaturas.map(a => a.id);
        const matDoc = listaMatriculas.filter(m => idsAsigDoc.includes(m.asignatura_id));
        setMisMatriculasDocente(matDoc);
      } else {
        // Cargar información institucional para Admin / Rector / Decano
        const resultado = await clienteApi.obtenerResumenPanel();
        setDatosAdmin(resultado);
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor backend.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  const inscribirseEnMateria = async (asignaturaId: number, nombreAsignatura: string) => {
    if (!usuario?.estudiante_id) {
      setError('Su cuenta no está vinculada a un expediente estudiantil.');
      return;
    }
    setError(null);
    setMensajeExito(null);
    try {
      await clienteApi.crearMatricula({
        estudiante_id: usuario.estudiante_id,
        asignatura_id: asignaturaId
      });
      setMensajeExito(`¡Inscripción exitosa en '${nombreAsignatura}'!`);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
        Cargando información del panel académico...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#f87171', marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={cargarDatos}>
          <RefreshCw size={16} /> Reintentar Carga
        </button>
      </div>
    );
  }

  // ==========================================
  // VISTA PARA ESTUDIANTE
  // ==========================================
  if (esEstudiante) {
    const idsInscritos = misMatriculas.map(m => m.asignatura_id);
    const creditosInscritos = misMatriculas.reduce((acc, m) => acc + (m.asignatura?.creditos || 0), 0);

    return (
      <div>
        {/* Banner de Bienvenida Personalizada */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={13} /> Portal Estudiantil Activo
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0' }}>
              ¡Hola, {usuario?.nombre_completo || 'Estudiante'}!
            </h2>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
              {perfilEstudiante?.carrera ? perfilEstudiante.carrera.nombre : 'Carrera Universitaria'} • Semestre {perfilEstudiante?.semestre_actual || 1}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span className="badge badge-active" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Expediente: {perfilEstudiante?.estado || 'Activo'}
            </span>
          </div>
        </div>

        {mensajeExito && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '10px', color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{mensajeExito}</span>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Tarjetas de Métricas del Estudiante */}
        <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
          <TarjetaEstadistica
            titulo="Materias Inscritas"
            valor={misMatriculas.length}
            icono={BookOpen}
            color="#818cf8"
            colorFondo="rgba(99, 102, 241, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Créditos Cursando"
            valor={`${creditosInscritos} pts`}
            icono={Award}
            color="#34d399"
            colorFondo="rgba(16, 185, 129, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Promedio Acumulado"
            valor={`${perfilEstudiante?.promedio_acumulado || 0} pts`}
            icono={Sparkles}
            color="#fbbf24"
            colorFondo="rgba(245, 158, 11, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Semestre Actual"
            valor={`Semestre ${perfilEstudiante?.semestre_actual || 1}`}
            icono={GraduationCap}
            color="#c084fc"
            colorFondo="rgba(168, 85, 247, 0.15)"
          />
        </div>

        {/* Tabla: Mis Asignaturas Actuales */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#818cf8" />
              Mis Asignaturas Inscritas ({misMatriculas.length})
            </h3>
            <span className="badge badge-info">Gestión Vigente 2026-1</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>Aula & Horario</th>
                  <th>P1 (30%)</th>
                  <th>P2 (30%)</th>
                  <th>EF (40%)</th>
                  <th>Nota Final</th>
                  <th style={{ textAlign: 'right' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {misMatriculas.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                      Aún no estás inscrito en ninguna asignatura. Explora las materias ofertadas más abajo y haz clic en <strong>"+ Inscribirme"</strong>.
                    </td>
                  </tr>
                ) : (
                  misMatriculas.map((mat) => (
                    <tr key={mat.id}>
                      <td><code>{mat.asignatura?.codigo || 'N/A'}</code></td>
                      <td style={{ fontWeight: '600' }}>{mat.asignatura?.nombre || `Asignatura #${mat.asignatura_id}`}</td>
                      <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {mat.asignatura?.aula || 'Aula Principal'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {mat.asignatura?.horario || 'Horario regular'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#9ca3af' }}>{mat.nota_primer_parcial ?? '-'}</td>
                      <td style={{ color: '#9ca3af' }}>{mat.nota_segundo_parcial ?? '-'}</td>
                      <td style={{ color: '#9ca3af' }}>{mat.nota_examen_final ?? '-'}</td>
                      <td>
                        {mat.nota_final !== null && mat.nota_final !== undefined ? (
                          <span style={{ fontWeight: 700, color: mat.nota_final >= 51 ? '#34d399' : '#f87171' }}>
                            {mat.nota_final} pts
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Pendiente</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-aprobado">
                          <CheckCircle size={13} style={{ marginRight: 3 }} /> Inscrito
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla: Oferta Académica Disponible para Inscribir */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#fbbf24" />
              Oferta de Asignaturas Ofertadas ({misAsignaturasDisponibles.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Haz clic en "+ Inscribirme" para matricularte</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>Semestre</th>
                  <th>Docente Titular</th>
                  <th>Aula & Horario</th>
                  <th>Cupos</th>
                  <th>Créditos</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {misAsignaturasDisponibles.map((asig) => {
                  const yaInscrito = idsInscritos.includes(asig.id);
                  const cupoLleno = asig.estudiantes_inscritos >= asig.capacidad_maxima;
                  const esDeMiSemestre = !perfilEstudiante || asig.semestre_nivel === perfilEstudiante.semestre_actual;

                  return (
                    <tr key={asig.id}>
                      <td><code>{asig.codigo}</code></td>
                      <td style={{ fontWeight: '600' }}>{asig.nombre}</td>
                      <td>
                        <span className={`badge ${esDeMiSemestre ? 'badge-info' : 'badge-warning'}`}>
                          Semestre {asig.semestre_nivel || 1}
                          {!esDeMiSemestre && ' (Req. Permiso)'}
                        </span>
                      </td>
                      <td style={{ color: '#9ca3af' }}>{asig.docente?.nombre_completo || 'Por asignar'}</td>
                      <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {asig.aula || 'Lab General'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {asig.horario || 'Turno Mañana'}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem' }}>{asig.estudiantes_inscritos}/{asig.capacidad_maxima}</span>
                      </td>
                      <td><span className="badge badge-warning">{asig.creditos} crd</span></td>
                      <td style={{ textAlign: 'right' }}>
                        {yaInscrito ? (
                          <span className="badge badge-aprobado">
                            <CheckCircle size={13} style={{ marginRight: 3 }} /> Ya Inscrito
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            disabled={cupoLleno || idsInscritos.length >= 6}
                            onClick={() => inscribirseEnMateria(asig.id, asig.nombre)}
                            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                          >
                            {cupoLleno ? 'Sin Cupos' : idsInscritos.length >= 6 ? 'Límite (6/6)' : '+ Inscribirme'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA PARA DOCENTE
  // ==========================================
  if (esDocente) {
    const totalAlumnos = misMatriculasDocente.length;
    const evaluadas = misMatriculasDocente.filter(m => m.nota_final !== null && m.nota_final !== undefined).length;
    const pendientes = totalAlumnos - evaluadas;

    return (
      <div>
        {/* Banner Docente */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span className="badge badge-active" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <UserCheck size={13} /> Portal Docente Académico
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0' }}>
              ¡Bienvenido, Prof. {perfilDocente?.nombre_completo || usuario?.nombre_completo}!
            </h2>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>
              Especialidad: {perfilDocente?.especialidad || 'Docencia Universitaria'} • {perfilDocente?.grado_academico || 'Docente Titular'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Departamento: {perfilDocente?.departamento || 'Ingeniería'}
            </span>
          </div>
        </div>

        {mensajeExito && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '10px', color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{mensajeExito}</span>
          </div>
        )}

        {/* Métricas del Docente */}
        <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
          <TarjetaEstadistica
            titulo="Mis Cursos Impartiendo"
            valor={misAsignaturasDocente.length}
            icono={BookOpen}
            color="#818cf8"
            colorFondo="rgba(99, 102, 241, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Total Alumnos A Cargo"
            valor={totalAlumnos}
            icono={Users}
            color="#34d399"
            colorFondo="rgba(16, 185, 129, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Actas Evaluadas"
            valor={evaluadas}
            icono={CheckCircle}
            color="#fbbf24"
            colorFondo="rgba(245, 158, 11, 0.15)"
          />
          <TarjetaEstadistica
            titulo="Notas Pendientes"
            valor={pendientes}
            icono={Award}
            color="#c084fc"
            colorFondo="rgba(168, 85, 247, 0.15)"
          />
        </div>

        {/* Tabla: Mis Cursos Asignados */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#34d399" />
              Mis Cursos Asignados Impartiendo ({misAsignaturasDocente.length})
            </h3>
            <span className="badge badge-active">Gestión Activa 2026-1</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>Semestre</th>
                  <th>Carrera</th>
                  <th>Aula & Horario</th>
                  <th>Inscritos</th>
                  <th>Créditos</th>
                </tr>
              </thead>
              <tbody>
                {misAsignaturasDocente.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No tienes cursos asignados como docente titular para este periodo académico.
                    </td>
                  </tr>
                ) : (
                  misAsignaturasDocente.map((asig) => (
                    <tr key={asig.id}>
                      <td><code>{asig.codigo}</code></td>
                      <td style={{ fontWeight: '600' }}>{asig.nombre}</td>
                      <td><span className="badge badge-info">Semestre {asig.semestre_nivel || 1}</span></td>
                      <td><span className="badge badge-warning">{asig.carrera ? asig.carrera.codigo : `ID #${asig.carrera_id}`}</span></td>
                      <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {asig.aula || 'Por asignar'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {asig.horario || 'Por definir'}</span>
                        </div>
                      </td>
                      <td><span style={{ fontWeight: 700 }}>{asig.estudiantes_inscritos} alumnos</span></td>
                      <td><span className="badge badge-warning">{asig.creditos} crd</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla: Estudiantes Inscritos en Mis Cursos & Carga de Notas */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="#fbbf24" />
              Estudiantes Inscritos & Registro de Notas ({misMatriculasDocente.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Haz clic en "Poner / Editar Nota" para calificar</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Cédula</th>
                  <th>Asignatura</th>
                  <th>P1 (30%)</th>
                  <th>P2 (30%)</th>
                  <th>EF (40%)</th>
                  <th>Nota Final</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Evaluación</th>
                </tr>
              </thead>
              <tbody>
                {misMatriculasDocente.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                      Aún no hay estudiantes matriculados en tus materias asignadas.
                    </td>
                  </tr>
                ) : (
                  misMatriculasDocente.map((mat) => (
                    <tr key={mat.id}>
                      <td style={{ fontWeight: '600' }}>
                        {mat.estudiante ? (mat.estudiante.nombre_completo || `${mat.estudiante.nombres} ${mat.estudiante.apellidos}`) : `Estudiante #${mat.estudiante_id}`}
                      </td>
                      <td><code>{mat.estudiante ? mat.estudiante.cedula : 'N/A'}</code></td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#a5b4fc' }}>{mat.asignatura?.codigo}</span> - {mat.asignatura?.nombre}
                      </td>
                      <td style={{ color: '#9ca3af' }}>{mat.nota_primer_parcial ?? '-'}</td>
                      <td style={{ color: '#9ca3af' }}>{mat.nota_segundo_parcial ?? '-'}</td>
                      <td style={{ color: '#9ca3af' }}>{mat.nota_examen_final ?? '-'}</td>
                      <td>
                        {mat.nota_final !== null && mat.nota_final !== undefined ? (
                          <span style={{ fontWeight: 700, color: mat.nota_final >= 51 ? '#34d399' : '#f87171' }}>
                            {mat.nota_final} pts
                          </span>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Pendiente</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${mat.estado === 'Aprobado' ? 'badge-aprobado' : mat.estado === 'Reprobado' ? 'badge-reprobado' : 'badge-info'}`}>
                          {mat.estado}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-primary"
                          onClick={() => {
                            setMatriculaSeleccionada(mat);
                            setFormularioNotas({
                              estado: mat.estado,
                              nota_primer_parcial: mat.nota_primer_parcial !== null && mat.nota_primer_parcial !== undefined ? String(mat.nota_primer_parcial) : '',
                              nota_segundo_parcial: mat.nota_segundo_parcial !== null && mat.nota_segundo_parcial !== undefined ? String(mat.nota_segundo_parcial) : '',
                              nota_examen_final: mat.nota_examen_final !== null && mat.nota_examen_final !== undefined ? String(mat.nota_examen_final) : ''
                            });
                            setModalNotasAbierto(true);
                          }}
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                        >
                          Poner / Editar Nota
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Calificaciones para Docente */}
        <VentanaModal
          estaAbierto={modalNotasAbierto}
          alCerrar={() => setModalNotasAbierto(false)}
          titulo={`Calificar a: ${matriculaSeleccionada?.estudiante?.nombre_completo || 'Estudiante'}`}
        >
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!matriculaSeleccionada) return;
            try {
              const payload: Partial<Matricula> = {
                estado: formularioNotas.estado,
                nota_primer_parcial: formularioNotas.nota_primer_parcial !== '' ? parseFloat(formularioNotas.nota_primer_parcial) : undefined,
                nota_segundo_parcial: formularioNotas.nota_segundo_parcial !== '' ? parseFloat(formularioNotas.nota_segundo_parcial) : undefined,
                nota_examen_final: formularioNotas.nota_examen_final !== '' ? parseFloat(formularioNotas.nota_examen_final) : undefined
              };
              await clienteApi.actualizarMatricula(matriculaSeleccionada.id, payload);
              setMensajeExito(`¡Notas actualizadas con éxito para ${matriculaSeleccionada.estudiante?.nombre_completo || 'estudiante'}!`);
              setModalNotasAbierto(false);
              cargarDatos();
            } catch (err: any) {
              setError(err.message);
            }
          }}>
            <div className="form-row">
              <div className="form-group">
                <label>Primer Parcial (30%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="Ej. 85.0"
                  value={formularioNotas.nota_primer_parcial}
                  onChange={(e) => setFormularioNotas({ ...formularioNotas, nota_primer_parcial: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Segundo Parcial (30%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="Ej. 90.0"
                  value={formularioNotas.nota_segundo_parcial}
                  onChange={(e) => setFormularioNotas({ ...formularioNotas, nota_segundo_parcial: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Examen Final (40%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="form-control"
                  placeholder="Ej. 88.0"
                  value={formularioNotas.nota_examen_final}
                  onChange={(e) => setFormularioNotas({ ...formularioNotas, nota_examen_final: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Estado de Matrícula</label>
                <select
                  className="form-control"
                  value={formularioNotas.estado}
                  onChange={(e) => setFormularioNotas({ ...formularioNotas, estado: e.target.value })}
                >
                  <option value="Inscrito">Inscrito</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Reprobado">Reprobado</option>
                  <option value="Retirado">Retirado</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalNotasAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Guardar Calificaciones</button>
            </div>
          </form>
        </VentanaModal>
      </div>
    );
  }

  // ==========================================
  // VISTA PARA ADMINISTRADOR / RECTOR / DECANO
  // ==========================================
  const metricas = datosAdmin?.metricas || { total_estudiantes: 0, total_docentes: 0, total_carreras: 0, total_asignaturas: 0, total_matriculas: 0 };
  const estudiantes_recientes = datosAdmin?.estudiantes_recientes || [];
  const asignaturas_recientes = datosAdmin?.asignaturas_recientes || [];

  return (
    <div>
      {/* Tarjetas de Métricas Universitarias */}
      <div className="stats-grid">
        <TarjetaEstadistica
          titulo="Estudiantes Registrados"
          valor={metricas.total_estudiantes}
          icono={Users}
          color="#6366f1"
          colorFondo="rgba(99, 102, 241, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Docentes Activos"
          valor={metricas.total_docentes}
          icono={GraduationCap}
          color="#10b981"
          colorFondo="rgba(16, 185, 129, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Carreras Universitarias"
          valor={metricas.total_carreras}
          icono={Building2}
          color="#ec4899"
          colorFondo="rgba(236, 72, 153, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Asignaturas Ofertadas"
          valor={metricas.total_asignaturas}
          icono={BookOpen}
          color="#f59e0b"
          colorFondo="rgba(245, 158, 11, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Matrículas Registradas"
          valor={metricas.total_matriculas}
          icono={FileCheck}
          color="#8b5cf6"
          colorFondo="rgba(139, 92, 246, 0.15)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
        {/* Estudiantes Inscritos Recientemente */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Últimos Estudiantes Registrados</h3>
            <span className="badge badge-info">{estudiantes_recientes.length} recientes</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Estudiante</th>
                  <th>Semestre</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes_recientes.map((est) => (
                  <tr key={est.id}>
                    <td><code>{est.cedula}</code></td>
                    <td style={{ fontWeight: '600' }}>{est.nombres} {est.apellidos}</td>
                    <td><span className="badge badge-info">Semestre {est.semestre_actual}</span></td>
                    <td>
                      <span className={`badge ${est.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>
                        {est.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Asignaturas Disponibles */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Oferta Académica 2026-1</h3>
            <span className="badge badge-warning">Gestión Vigente</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>Cupos</th>
                  <th>Créditos</th>
                </tr>
              </thead>
              <tbody>
                {asignaturas_recientes.map((asig) => (
                  <tr key={asig.id}>
                    <td><code>{asig.codigo}</code></td>
                    <td style={{ fontWeight: '600' }}>{asig.nombre}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem' }}>{asig.estudiantes_inscritos} / {asig.capacidad_maxima}</span>
                    </td>
                    <td><span className="badge badge-info">{asig.creditos} pts</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
