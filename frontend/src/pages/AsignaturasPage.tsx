import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { Asignatura, Docente, Carrera, Estudiante, Aula } from '../types';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { VentanaModal } from '../components/VentanaModal';
import { Search, Plus, Edit2, Trash2, AlertCircle, Clock, MapPin, CheckCircle, UserCheck, Building2 } from 'lucide-react';

export const AsignaturasPage: React.FC = () => {
  const { usuario } = useAutenticacion();
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [misMatriculasIds, setMisMatriculasIds] = useState<number[]>([]);
  const [perfilEstudiante, setPerfilEstudiante] = useState<Estudiante | null>(null);
  const [filtroEstudiante, setFiltroEstudiante] = useState<'todas' | 'mis_materias'>('todas');
  const [filtroDocente, setFiltroDocente] = useState<'mis_cursos' | 'todas'>('mis_cursos');
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [modalCarreraAbierto, setModalCarreraAbierto] = useState<boolean>(false);
  const [asignaturaEditando, setAsignaturaEditando] = useState<Asignatura | null>(null);
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    creditos: 4,
    semestre_nivel: 1,
    carrera_id: 1,
    docente_id: '',
    periodo_academico: '2026-1',
    capacidad_maxima: 30,
    aula: 'Lab Software 1',
    horario: 'Lun/Mié 08:00 - 10:00'
  });

  const [formularioCarrera, setFormularioCarrera] = useState({
    codigo: '',
    nombre: '',
    facultad: 'Facultad de Ingeniería y Tecnología',
    duracion_semestres: 10,
    total_creditos: 240,
    estado: 'Activa'
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const paramsAsig: Record<string, string> = { busqueda };

      // Si el usuario es Estudiante, obtener su perfil para filtrar las materias de su carrera
      if (usuario?.rol === 'Estudiante' && usuario.estudiante_id) {
        const [misMatriculas, perfilEst] = await Promise.all([
          clienteApi.obtenerMatriculas({ estudiante_id: String(usuario.estudiante_id) }),
          clienteApi.obtenerEstudiantePorId(usuario.estudiante_id)
        ]);
        setMisMatriculasIds(misMatriculas.map(m => m.asignatura_id));
        setPerfilEstudiante(perfilEst);
        if (perfilEst?.carrera_id) {
          paramsAsig.carrera_id = String(perfilEst.carrera_id);
        }
      }

      const [listaAsignaturas, listaDocentes, listaCarreras, listaAulas] = await Promise.all([
        clienteApi.obtenerAsignaturas(paramsAsig),
        clienteApi.obtenerDocentes(),
        clienteApi.obtenerCarreras(),
        clienteApi.obtenerAulas()
      ]);

      setAsignaturas(listaAsignaturas);
      setDocentes(listaDocentes);
      setCarreras(listaCarreras);
      setAulas(listaAulas);

      if (listaCarreras.length > 0 && !formulario.carrera_id) {
        setFormulario(prev => ({ ...prev, carrera_id: listaCarreras[0].id }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [busqueda]);

  const abrirModalCrear = () => {
    setAsignaturaEditando(null);
    setFormulario({
      codigo: '',
      nombre: '',
      creditos: 4,
      semestre_nivel: 1,
      carrera_id: carreras.length > 0 ? carreras[0].id : 1,
      docente_id: docentes.length > 0 ? String(docentes[0].id) : '',
      periodo_academico: '2026-1',
      capacidad_maxima: 30,
      aula: 'Lab Software 1',
      horario: 'Lun/Mié 08:00 - 10:00'
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (asignatura: Asignatura) => {
    setAsignaturaEditando(asignatura);
    setFormulario({
      codigo: asignatura.codigo,
      nombre: asignatura.nombre,
      creditos: asignatura.creditos,
      semestre_nivel: asignatura.semestre_nivel || 1,
      carrera_id: asignatura.carrera_id,
      docente_id: asignatura.docente_id ? String(asignatura.docente_id) : '',
      periodo_academico: asignatura.periodo_academico,
      capacidad_maxima: asignatura.capacidad_maxima,
      aula: asignatura.aula || '',
      horario: asignatura.horario || ''
    });
    setModalAbierto(true);
  };

  const guardarAsignatura = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...formulario,
        creditos: Number(formulario.creditos),
        semestre_nivel: Number(formulario.semestre_nivel),
        carrera_id: Number(formulario.carrera_id),
        capacidad_maxima: Number(formulario.capacidad_maxima),
        docente_id: formulario.docente_id ? Number(formulario.docente_id) : undefined
      };

      if (asignaturaEditando) {
        await clienteApi.actualizarAsignatura(asignaturaEditando.id, payload);
      } else {
        await clienteApi.crearAsignatura(payload);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const eliminarAsignatura = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta asignatura?')) return;
    try {
      await clienteApi.eliminarAsignatura(id);
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Función exclusiva para que el Estudiante se inscriba en una materia con 1 clic
  const inscribirseEnAsignatura = async (asignaturaId: number, nombreAsignatura: string) => {
    if (!usuario?.estudiante_id) {
      setError('Su cuenta no está vinculada a un expediente de estudiante.');
      return;
    }
    setError(null);
    setMensajeExito(null);
    try {
      await clienteApi.crearMatricula({
        estudiante_id: usuario.estudiante_id,
        asignatura_id: asignaturaId
      });
      setMensajeExito(`¡Inscripción exitosa en '${nombreAsignatura}'! Puedes verla en tu sección de Matrículas & Notas.`);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const abrirModalCrearCarrera = () => {
    setFormularioCarrera({
      codigo: '',
      nombre: '',
      facultad: 'Facultad de Ingeniería y Tecnología',
      duracion_semestres: 10,
      total_creditos: 240,
      estado: 'Activa'
    });
    setModalCarreraAbierto(true);
  };

  const guardarCarreraRapida = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const nuevaCarrera = await clienteApi.crearCarrera({
        ...formularioCarrera,
        duracion_semestres: Number(formularioCarrera.duracion_semestres),
        total_creditos: Number(formularioCarrera.total_creditos)
      });
      setModalCarreraAbierto(false);
      setMensajeExito(`¡Carrera '${nuevaCarrera.nombre}' (${nuevaCarrera.codigo}) registrada exitosamente!`);
      const listaActualizada = await clienteApi.obtenerCarreras();
      setCarreras(listaActualizada);
      setFormulario(prev => ({ ...prev, carrera_id: nuevaCarrera.id }));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const esGestionAcademica = usuario?.rol === 'Administrador' || usuario?.rol === 'Decano' || usuario?.rol === 'Rector';
  const esAdmin = usuario?.rol === 'Administrador';
  const esDocente = usuario?.rol === 'Docente';
  const esEstudiante = usuario?.rol === 'Estudiante';

  return (
    <div>
      <div className="section-header">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar asignatura por código o nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Administrador, Decano o Rector pueden crear nuevas materias y carreras */}
        {esGestionAcademica && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={abrirModalCrearCarrera}>
              <Building2 size={18} /> + Nueva Carrera
            </button>
            <button className="btn btn-primary" onClick={abrirModalCrear}>
              <Plus size={18} /> + Nueva Asignatura
            </button>
          </div>
        )}
      </div>

      {/* Pestañas de filtro de asignaturas para el estudiante */}
      {esEstudiante && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            className={`btn ${filtroEstudiante === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroEstudiante('todas')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            Todas las Ofertas Académicas ({asignaturas.length})
          </button>
          <button
            className={`btn ${filtroEstudiante === 'mis_materias' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroEstudiante('mis_materias')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <CheckCircle size={15} style={{ marginRight: '0.4rem' }} />
            Mis Materias Anotadas ({misMatriculasIds.length})
          </button>
        </div>
      )}

      {/* Pestañas de filtro de asignaturas para el docente */}
      {esDocente && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            className={`btn ${filtroDocente === 'mis_cursos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroDocente('mis_cursos')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <UserCheck size={15} style={{ marginRight: '0.4rem' }} />
            Mis Cursos Asignados Impartiendo ({asignaturas.filter(a => usuario?.docente_id === a.docente_id).length})
          </button>
          <button
            className={`btn ${filtroDocente === 'todas' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFiltroDocente('todas')}
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            Todas las Asignaturas Ofertadas ({asignaturas.length})
          </button>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {mensajeExito && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1rem', borderRadius: '10px', color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span>{mensajeExito}</span>
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Asignatura</th>
              <th>Semestre</th>
              <th>Carrera</th>
              <th>Docente Titular</th>
              <th>Aula & Horario</th>
              <th>Ocupación de Cupos</th>
              <th>Créditos</th>
              <th style={{ textAlign: 'right' }}>
                {esEstudiante ? 'Inscripción' : esAdmin ? 'Acciones' : 'Estado'}
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Cargando asignaturas...</td>
              </tr>
            ) : (() => {
              const asignaturasMostradas = esEstudiante && filtroEstudiante === 'mis_materias' 
                ? asignaturas.filter(a => misMatriculasIds.includes(a.id))
                : esDocente && filtroDocente === 'mis_cursos'
                ? asignaturas.filter(a => usuario?.docente_id === a.docente_id)
                : asignaturas;

              if (asignaturasMostradas.length === 0) {
                return (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      {filtroEstudiante === 'mis_materias' 
                        ? 'Aún no estás anotado en ninguna materia. Explora las asignaturas y haz clic en "+ Inscribirme".'
                        : 'No se encontraron asignaturas registradas.'}
                    </td>
                  </tr>
                );
              }

              return asignaturasMostradas.map((asig) => {
                const yaInscrito = misMatriculasIds.includes(asig.id);
                const cupoLleno = asig.estudiantes_inscritos >= asig.capacidad_maxima;
                const esMiMateriaDocente = esDocente && usuario?.docente_id === asig.docente_id;
                const esDeMiSemestre = !esEstudiante || !perfilEstudiante || asig.semestre_nivel === perfilEstudiante.semestre_actual;

                return (
                  <tr key={asig.id} style={{ background: esMiMateriaDocente ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <td><code>{asig.codigo}</code></td>
                    <td style={{ fontWeight: '600' }}>
                      {asig.nombre}
                      {esMiMateriaDocente && (
                        <span className="badge badge-active" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                          <UserCheck size={11} style={{ marginRight: 3 }} /> Impartido por mí
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${esDeMiSemestre ? 'badge-info' : 'badge-warning'}`}>
                        Semestre {asig.semestre_nivel || 1}
                        {!esDeMiSemestre && ' (Req. Permiso)'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {asig.carrera ? asig.carrera.codigo : `Carrera #${asig.carrera_id}`}
                      </span>
                    </td>
                    <td style={{ color: '#9ca3af' }}>
                      {asig.docente ? asig.docente.nombre_completo : <span style={{ fontStyle: 'italic' }}>Sin Asignar</span>}
                    </td>
                    <td style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {asig.aula || 'Por asignar'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {asig.horario || 'Por definir'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: '#1f2937', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${(asig.estudiantes_inscritos / asig.capacidad_maxima) * 100}%`, background: cupoLleno ? '#ef4444' : '#6366f1', height: '100%' }}></div>
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>{asig.estudiantes_inscritos}/{asig.capacidad_maxima}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-warning">{asig.creditos} crd</span></td>
                    
                    {/* Botones y funcionalidades condicionales por Rol */}
                    <td style={{ textAlign: 'right' }}>
                      {esEstudiante ? (
                        yaInscrito ? (
                          <span className="badge badge-aprobado">
                            <CheckCircle size={13} style={{ marginRight: 4 }} /> Ya Inscrito
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            disabled={cupoLleno || misMatriculasIds.length >= 6}
                            onClick={() => inscribirseEnAsignatura(asig.id, asig.nombre)}
                            style={{ fontSize: '0.78rem', padding: '0.4rem 0.8rem' }}
                          >
                            {cupoLleno ? 'Sin Cupos' : misMatriculasIds.length >= 6 ? 'Límite (6/6)' : '+ Inscribirme'}
                          </button>
                        )
                      ) : esGestionAcademica ? (
                        <>
                          <button className="btn btn-secondary btn-icon" onClick={() => abrirModalEditar(asig)} style={{ marginRight: '0.4rem' }}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => eliminarAsignatura(asig.id)}>
                            <Trash2 size={16} />
                          </button>
                        </>
                      ) : (
                        <span className="badge badge-info">{asig.estado}</span>
                      )}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear/Editar Asignaturas (Administrador, Decano, Rector) */}
      {esGestionAcademica && (
        <VentanaModal
          estaAbierto={modalAbierto}
          alCerrar={() => setModalAbierto(false)}
          titulo={asignaturaEditando ? 'Editar Asignatura' : 'Nueva Asignatura Académica'}
        >
          <form onSubmit={guardarAsignatura}>
            <div className="form-row">
              <div className="form-group">
                <label>Código de Asignatura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. SIS-301"
                  className="form-control"
                  value={formulario.codigo}
                  onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Carrera Perteneciente</label>
                  <button
                    type="button"
                    onClick={abrirModalCrearCarrera}
                    style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline' }}
                  >
                    + Crear nueva carrera
                  </button>
                </div>
                <select
                  className="form-control"
                  value={formulario.carrera_id}
                  onChange={(e) => setFormulario({ ...formulario, carrera_id: Number(e.target.value) })}
                >
                  {carreras.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.nombre} ({car.codigo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo de la Asignatura</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Arquitectura Limpia & Patrones de Software"
                  className="form-control"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Semestre Nivel (1 a 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  className="form-control"
                  value={formulario.semestre_nivel}
                  onChange={(e) => setFormulario({ ...formulario, semestre_nivel: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Créditos Académicos</label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  required
                  className="form-control"
                  value={formulario.creditos}
                  onChange={(e) => setFormulario({ ...formulario, creditos: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Capacidad Máxima (Cupos)</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  required
                  className="form-control"
                  value={formulario.capacidad_maxima}
                  onChange={(e) => setFormulario({ ...formulario, capacidad_maxima: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Docente Titular Asignado</label>
              <select
                className="form-control"
                value={formulario.docente_id}
                onChange={(e) => setFormulario({ ...formulario, docente_id: e.target.value })}
              >
                <option value="">-- Sin docente asignado --</option>
                {docentes.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.nombre_completo} ({doc.especialidad})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Aula o Laboratorio Asignado</label>
                {aulas.length > 0 ? (
                  <select
                    className="form-control"
                    value={formulario.aula}
                    onChange={(e) => setFormulario({ ...formulario, aula: e.target.value })}
                  >
                    <option value="">-- Seleccionar Aula por Capacidad --</option>
                    {aulas.map((a) => (
                      <option key={a.id} value={`${a.nombre} (${a.codigo})`}>
                        {a.nombre} [{a.codigo}] - Cap. {a.capacidad_maxima} pers. ({a.edificio})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Ej. Lab Software 3"
                    className="form-control"
                    value={formulario.aula}
                    onChange={(e) => setFormulario({ ...formulario, aula: e.target.value })}
                  />
                )}
              </div>
              <div className="form-group">
                <label>Horario de Clases</label>
                <input
                  type="text"
                  placeholder="Ej. Lun/Mié 08:00 - 10:00"
                  className="form-control"
                  value={formulario.horario}
                  onChange={(e) => setFormulario({ ...formulario, horario: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {asignaturaEditando ? 'Guardar Cambios' : 'Crear Asignatura'}
              </button>
            </div>
          </form>
        </VentanaModal>
      )}

      {/* Modal para Crear Carrera Universitaria al vuelo */}
      {esGestionAcademica && (
        <VentanaModal
          estaAbierto={modalCarreraAbierto}
          alCerrar={() => setModalCarreraAbierto(false)}
          titulo="Nueva Carrera Universitaria"
        >
          <form onSubmit={guardarCarreraRapida}>
            <div className="form-row">
              <div className="form-group">
                <label>Código Identificador</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. ING-MEC"
                  className="form-control"
                  value={formularioCarrera.codigo}
                  onChange={(e) => setFormularioCarrera({ ...formularioCarrera, codigo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Duración (Semestres)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  required
                  className="form-control"
                  value={formularioCarrera.duracion_semestres}
                  onChange={(e) => setFormularioCarrera({ ...formularioCarrera, duracion_semestres: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nombre Completo de la Carrera</label>
              <input
                type="text"
                required
                placeholder="Ej. Ingeniería Mecatrónica & Robótica"
                className="form-control"
                value={formularioCarrera.nombre}
                onChange={(e) => setFormularioCarrera({ ...formularioCarrera, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Facultad Universitaria</label>
              <input
                type="text"
                required
                placeholder="Ej. Facultad de Ingeniería y Tecnología"
                className="form-control"
                value={formularioCarrera.facultad}
                onChange={(e) => setFormularioCarrera({ ...formularioCarrera, facultad: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Créditos Requeridos</label>
                <input
                  type="number"
                  min="50"
                  max="400"
                  required
                  className="form-control"
                  value={formularioCarrera.total_creditos}
                  onChange={(e) => setFormularioCarrera({ ...formularioCarrera, total_creditos: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  className="form-control"
                  value={formularioCarrera.estado}
                  onChange={(e) => setFormularioCarrera({ ...formularioCarrera, estado: e.target.value })}
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalCarreraAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Crear Carrera</button>
            </div>
          </form>
        </VentanaModal>
      )}
    </div>
  );
};
