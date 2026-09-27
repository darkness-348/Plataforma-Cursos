import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { Carrera, Asignatura, Docente } from '../types';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { VentanaModal } from '../components/VentanaModal';
import { Plus, Edit2, Trash2, AlertCircle, Building2, BookOpen, ChevronDown, ChevronUp, Layers, CheckCircle } from 'lucide-react';

export const CarrerasPage: React.FC = () => {
  const { usuario } = useAutenticacion();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [carreraExpandidaId, setCarreraExpandidaId] = useState<number | null>(null);
  
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modales
  const [modalCarreraAbierto, setModalCarreraAbierto] = useState<boolean>(false);
  const [carreraEditando, setCarreraEditando] = useState<Carrera | null>(null);
  const [formularioCarrera, setFormularioCarrera] = useState({
    codigo: '',
    nombre: '',
    facultad: 'Facultad de Ingeniería y Tecnología',
    duracion_semestres: 10,
    total_creditos: 240,
    estado: 'Activa'
  });

  const [modalAsignaturaAbierto, setModalAsignaturaAbierto] = useState<boolean>(false);
  const [formularioAsignatura, setFormularioAsignatura] = useState({
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

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [listaCarreras, listaAsignaturas, listaDocentes] = await Promise.all([
        clienteApi.obtenerCarreras(),
        clienteApi.obtenerAsignaturas(),
        clienteApi.obtenerDocentes()
      ]);
      setCarreras(listaCarreras);
      setAsignaturas(listaAsignaturas);
      setDocentes(listaDocentes);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalCrearCarrera = () => {
    setCarreraEditando(null);
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

  const abrirModalEditarCarrera = (carrera: Carrera) => {
    setCarreraEditando(carrera);
    setFormularioCarrera({
      codigo: carrera.codigo,
      nombre: carrera.nombre,
      facultad: carrera.facultad,
      duracion_semestres: carrera.duracion_semestres,
      total_creditos: carrera.total_creditos,
      estado: carrera.estado
    });
    setModalCarreraAbierto(true);
  };

  const guardarCarrera = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    try {
      const payload = {
        ...formularioCarrera,
        duracion_semestres: Number(formularioCarrera.duracion_semestres),
        total_creditos: Number(formularioCarrera.total_creditos)
      };

      if (carreraEditando) {
        await clienteApi.actualizarCarrera(carreraEditando.id, payload);
        setMensajeExito(`¡Carrera '${formularioCarrera.nombre}' actualizada exitosamente!`);
      } else {
        const nueva = await clienteApi.crearCarrera(payload);
        setMensajeExito(`¡Carrera '${nueva.nombre}' (${nueva.codigo}) creada exitosamente!`);
      }
      setModalCarreraAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const eliminarCarrera = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta carrera universitaria?')) return;
    setError(null);
    try {
      await clienteApi.eliminarCarrera(id);
      setMensajeExito('Carrera eliminada exitosamente.');
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Abrir modal para añadir una asignatura a una carrera y semestre específico
  const abrirModalCrearAsignaturaParaCarrera = (carreraId: number, semestreNivel: number = 1) => {
    const car = carreras.find(c => c.id === carreraId);
    const codPrefix = car ? car.codigo.split('-')[0] || 'MAT' : 'MAT';
    setFormularioAsignatura({
      codigo: `${codPrefix}-${semestreNivel}01`,
      nombre: '',
      creditos: 4,
      semestre_nivel: semestreNivel,
      carrera_id: carreraId,
      docente_id: docentes.length > 0 ? String(docentes[0].id) : '',
      periodo_academico: '2026-1',
      capacidad_maxima: 30,
      aula: 'Aula General 1',
      horario: 'Lun/Mié 08:00 - 10:00'
    });
    setModalAsignaturaAbierto(true);
  };

  const guardarAsignaturaNueva = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    try {
      const payload = {
        ...formularioAsignatura,
        creditos: Number(formularioAsignatura.creditos),
        semestre_nivel: Number(formularioAsignatura.semestre_nivel),
        carrera_id: Number(formularioAsignatura.carrera_id),
        capacidad_maxima: Number(formularioAsignatura.capacidad_maxima),
        docente_id: formularioAsignatura.docente_id ? Number(formularioAsignatura.docente_id) : undefined
      };

      const nuevaAsig = await clienteApi.crearAsignatura(payload);
      setMensajeExito(`¡Asignatura '${nuevaAsig.nombre}' (${nuevaAsig.codigo}) añadida al Semestre ${nuevaAsig.semestre_nivel}!`);
      setModalAsignaturaAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const esGestionAcademica = usuario?.rol === 'Administrador' || usuario?.rol === 'Decano' || usuario?.rol === 'Rector';

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={22} color="#818cf8" />
            Oferta de Carreras Universitarias
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Gestión de programas académicos, facultades y mallas curriculares por semestre</p>
        </div>

        {esGestionAcademica && (
          <button className="btn btn-primary" onClick={abrirModalCrearCarrera}>
            <Plus size={18} /> + Nueva Carrera
          </button>
        )}
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {cargando ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>
            Cargando programas de carreras y mallas curriculares...
          </div>
        ) : carreras.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af' }}>
            No hay carreras registradas en la universidad. Haz clic en <strong>"+ Nueva Carrera"</strong> para crear una.
          </div>
        ) : (
          carreras.map((car) => {
            const materiasCarrera = asignaturas.filter(a => a.carrera_id === car.id);
            const estaExpandida = carreraExpandidaId === car.id;

            // Agrupar asignaturas por semestre
            const semestresMap: Record<number, Asignatura[]> = {};
            materiasCarrera.forEach(m => {
              const sem = m.semestre_nivel || 1;
              if (!semestresMap[sem]) semestresMap[sem] = [];
              semestresMap[sem].push(m);
            });

            return (
              <div key={car.id} className="card" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '0.95rem'
                    }}>
                      {car.codigo}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0, color: '#f3f4f6' }}>
                        {car.nombre}
                      </h3>
                      <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.83rem', color: '#9ca3af' }}>
                        {car.facultad} • {car.duracion_semestres} Semestres • {car.total_creditos} Créditos Totales
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={13} /> {materiasCarrera.length} Materias Registradas
                    </span>

                    <button
                      className="btn btn-secondary"
                      onClick={() => setCarreraExpandidaId(estaExpandida ? null : car.id)}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
                    >
                      <Layers size={14} style={{ marginRight: '0.3rem' }} />
                      Malla Curricular
                      {estaExpandida ? <ChevronUp size={16} style={{ marginLeft: '0.3rem' }} /> : <ChevronDown size={16} style={{ marginLeft: '0.3rem' }} />}
                    </button>

                    {esGestionAcademica && (
                      <>
                        <button className="btn btn-secondary btn-icon" onClick={() => abrirModalEditarCarrera(car)} title="Editar Carrera">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => eliminarCarrera(car.id)} title="Eliminar Carrera">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* VISTA DESPLEGABLE: MALLA CURRICULAR POR SEMESTRES */}
                {estaExpandida && (
                  <div style={{
                    marginTop: '1.25rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e5e7eb', margin: 0 }}>
                        📚 Malla Curricular por Semestres - {car.nombre}
                      </h4>
                      {esGestionAcademica && (
                        <button
                          className="btn btn-primary"
                          onClick={() => abrirModalCrearAsignaturaParaCarrera(car.id, 1)}
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                        >
                          <Plus size={14} /> + Añadir Materia a esta Carrera
                        </button>
                      )}
                    </div>

                    {Object.keys(semestresMap).length === 0 ? (
                      <div style={{ background: 'rgba(31, 41, 55, 0.4)', padding: '1.5rem', borderRadius: '10px', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                        No hay materias asignadas a esta carrera todavía. Haz clic en <strong>"+ Añadir Materia a esta Carrera"</strong> para crear la primera asignatura del plan de estudios.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {Array.from({ length: car.duracion_semestres }, (_, i) => i + 1).map((semNum) => {
                          const materiasDelSemestre = semestresMap[semNum] || [];

                          return (
                            <div key={semNum} style={{
                              background: materiasDelSemestre.length > 0 ? 'rgba(31, 41, 55, 0.6)' : 'rgba(17, 24, 39, 0.4)',
                              border: materiasDelSemestre.length > 0 ? '1px solid rgba(99, 102, 241, 0.25)' : '1px dashed rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              padding: '1rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: materiasDelSemestre.length > 0 ? '#818cf8' : '#6b7280' }}>
                                  Semestre {semNum}
                                </span>
                                {esGestionAcademica && (
                                  <button
                                    onClick={() => abrirModalCrearAsignaturaParaCarrera(car.id, semNum)}
                                    title={`Añadir materia al Semestre ${semNum}`}
                                    style={{
                                      background: 'rgba(99, 102, 241, 0.15)',
                                      border: '1px solid rgba(99, 102, 241, 0.3)',
                                      color: '#a5b4fc',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '6px',
                                      fontSize: '0.73rem',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    + Materia
                                  </button>
                                )}
                              </div>

                              {materiasDelSemestre.length === 0 ? (
                                <p style={{ fontSize: '0.78rem', color: '#6b7280', fontStyle: 'italic', margin: 0 }}>
                                  Sin asignaturas programadas
                                </p>
                              ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  {materiasDelSemestre.map(asig => (
                                    <li key={asig.id} style={{
                                      background: 'rgba(15, 23, 42, 0.6)',
                                      padding: '0.55rem 0.75rem',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(255, 255, 255, 0.05)',
                                      fontSize: '0.82rem',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}>
                                      <div>
                                        <div style={{ fontWeight: '600', color: '#f3f4f6' }}>
                                          <code>{asig.codigo}</code> - {asig.nombre}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                          {asig.creditos} crd • Cupos: {asig.estudiantes_inscritos}/{asig.capacidad_maxima}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal para Crear/Editar Carrera Universitaria */}
      <VentanaModal
        estaAbierto={modalCarreraAbierto}
        alCerrar={() => setModalCarreraAbierto(false)}
        titulo={carreraEditando ? 'Editar Carrera Universitaria' : 'Nueva Carrera Universitaria'}
      >
        <form onSubmit={guardarCarrera}>
          <div className="form-row">
            <div className="form-group">
              <label>Código Identificador de Carrera</label>
              <input
                type="text"
                required
                placeholder="Ej. ING-SIS, CIE-DAT"
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
            <label>Nombre de la Carrera</label>
            <input
              type="text"
              required
              placeholder="Ej. Ingeniería de Sistemas"
              className="form-control"
              value={formularioCarrera.nombre}
              onChange={(e) => setFormularioCarrera({ ...formularioCarrera, nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Facultad Universitaria Perteneciente</label>
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
            {carreraEditando && (
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
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalCarreraAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {carreraEditando ? 'Guardar Cambios' : 'Crear Carrera'}
            </button>
          </div>
        </form>
      </VentanaModal>

      {/* Modal para Crear Asignatura rápida desde Malla Curricular */}
      <VentanaModal
        estaAbierto={modalAsignaturaAbierto}
        alCerrar={() => setModalAsignaturaAbierto(false)}
        titulo="Añadir Asignatura a la Carrera"
      >
        <form onSubmit={guardarAsignaturaNueva}>
          <div className="form-row">
            <div className="form-group">
              <label>Código de Asignatura</label>
              <input
                type="text"
                required
                placeholder="Ej. SIS-101"
                className="form-control"
                value={formularioAsignatura.codigo}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, codigo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Carrera Perteneciente</label>
              <select
                className="form-control"
                value={formularioAsignatura.carrera_id}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, carrera_id: Number(e.target.value) })}
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
              <label>Nombre Completo de Asignatura</label>
              <input
                type="text"
                required
                placeholder="Ej. Programación Avanzada & Algoritmos"
                className="form-control"
                value={formularioAsignatura.nombre}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, nombre: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Semestre Nivel (1 a 10)</label>
              <input
                type="number"
                min="1"
                max="14"
                required
                className="form-control"
                value={formularioAsignatura.semestre_nivel}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, semestre_nivel: Number(e.target.value) })}
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
                value={formularioAsignatura.creditos}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, creditos: Number(e.target.value) })}
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
                value={formularioAsignatura.capacidad_maxima}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, capacidad_maxima: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Docente Titular Asignado</label>
            <select
              className="form-control"
              value={formularioAsignatura.docente_id}
              onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, docente_id: e.target.value })}
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
              <label>Aula / Laboratorio</label>
              <input
                type="text"
                placeholder="Ej. Lab Software 2"
                className="form-control"
                value={formularioAsignatura.aula}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, aula: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Horario de Clases</label>
              <input
                type="text"
                placeholder="Ej. Lun/Mié 08:00 - 10:00"
                className="form-control"
                value={formularioAsignatura.horario}
                onChange={(e) => setFormularioAsignatura({ ...formularioAsignatura, horario: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAsignaturaAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar Asignatura</button>
          </div>
        </form>
      </VentanaModal>
    </div>
  );
};
