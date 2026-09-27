import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { Matricula, Estudiante, Asignatura } from '../types';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { VentanaModal } from '../components/VentanaModal';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle2, XCircle, Award } from 'lucide-react';

export const MatriculasPage: React.FC = () => {
  const { usuario } = useAutenticacion();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal para nueva matrícula (solo Admin)
  const [modalInscripcionAbierto, setModalInscripcionAbierto] = useState<boolean>(false);
  const [formularioInscripcion, setFormularioInscripcion] = useState({
    estudiante_id: 1,
    asignatura_id: 1
  });

  // Modal para ingresar calificaciones / estado (Admin y Docente)
  const [modalNotasAbierto, setModalNotasAbierto] = useState<boolean>(false);
  const [matriculaSeleccionada, setMatriculaSeleccionada] = useState<Matricula | null>(null);
  const [formularioNotas, setFormularioNotas] = useState({
    estado: 'Inscrito',
    nota_primer_parcial: '',
    nota_segundo_parcial: '',
    nota_examen_final: ''
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const params: Record<string, string> = {};

      // Si el usuario es Estudiante, filtrar solo SUS propias matrículas
      if (usuario?.rol === 'Estudiante' && usuario.estudiante_id) {
        params.estudiante_id = String(usuario.estudiante_id);
      }

      const [listaMatriculas, listaEstudiantes, listaAsignaturas] = await Promise.all([
        clienteApi.obtenerMatriculas(params),
        clienteApi.obtenerEstudiantes(),
        clienteApi.obtenerAsignaturas()
      ]);

      // Si el usuario es Docente, filtrar matrículas de sus asignaturas asignadas
      let matriculasFiltradas = listaMatriculas;
      if (usuario?.rol === 'Docente' && usuario.docente_id) {
        const misAsignaturasIds = listaAsignaturas
          .filter(a => a.docente_id === usuario.docente_id)
          .map(a => a.id);
        matriculasFiltradas = listaMatriculas.filter(m => misAsignaturasIds.includes(m.asignatura_id));
      }

      setMatriculas(matriculasFiltradas);
      setEstudiantes(listaEstudiantes.filter(s => s.estado === 'Activo'));
      setAsignaturas(listaAsignaturas.filter(a => a.estado === 'Abierto'));

      if (listaEstudiantes.length > 0) {
        setFormularioInscripcion(prev => ({ ...prev, estudiante_id: listaEstudiantes[0].id }));
      }
      if (listaAsignaturas.length > 0) {
        setFormularioInscripcion(prev => ({ ...prev, asignatura_id: listaAsignaturas[0].id }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirModalInscripcion = () => {
    setFormularioInscripcion({
      estudiante_id: estudiantes.length > 0 ? estudiantes[0].id : 1,
      asignatura_id: asignaturas.length > 0 ? asignaturas[0].id : 1
    });
    setModalInscripcionAbierto(true);
  };

  const abrirModalNotas = (matricula: Matricula) => {
    setMatriculaSeleccionada(matricula);
    setFormularioNotas({
      estado: matricula.estado,
      nota_primer_parcial: matricula.nota_primer_parcial !== null && matricula.nota_primer_parcial !== undefined ? String(matricula.nota_primer_parcial) : '',
      nota_segundo_parcial: matricula.nota_segundo_parcial !== null && matricula.nota_segundo_parcial !== undefined ? String(matricula.nota_segundo_parcial) : '',
      nota_examen_final: matricula.nota_examen_final !== null && matricula.nota_examen_final !== undefined ? String(matricula.nota_examen_final) : ''
    });
    setModalNotasAbierto(true);
  };

  const matricularEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await clienteApi.crearMatricula({
        estudiante_id: Number(formularioInscripcion.estudiante_id),
        asignatura_id: Number(formularioInscripcion.asignatura_id)
      });
      setModalInscripcionAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const guardarCalificaciones = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaSeleccionada) return;
    setError(null);
    try {
      const payload: Partial<Matricula> = {
        estado: formularioNotas.estado,
        nota_primer_parcial: formularioNotas.nota_primer_parcial !== '' ? parseFloat(formularioNotas.nota_primer_parcial) : undefined,
        nota_segundo_parcial: formularioNotas.nota_segundo_parcial !== '' ? parseFloat(formularioNotas.nota_segundo_parcial) : undefined,
        nota_examen_final: formularioNotas.nota_examen_final !== '' ? parseFloat(formularioNotas.nota_examen_final) : undefined
      };
      await clienteApi.actualizarMatricula(matriculaSeleccionada.id, payload);
      setModalNotasAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelarMatricula = async (id: number) => {
    if (!window.confirm('¿Está seguro de retirar/cancelar esta matrícula?')) return;
    try {
      await clienteApi.eliminarMatricula(id);
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const obtenerInsigniaEstado = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
        return <span className="badge badge-aprobado"><CheckCircle2 size={13} style={{ marginRight: 4 }} /> Aprobado</span>;
      case 'Reprobado':
        return <span className="badge badge-reprobado"><XCircle size={13} style={{ marginRight: 4 }} /> Reprobado</span>;
      case 'Retirado':
        return <span className="badge badge-retirado">Retirado</span>;
      default:
        return <span className="badge badge-inscrito">Inscrito</span>;
    }
  };

  const esAdmin = usuario?.rol === 'Administrador';
  const esDocente = usuario?.rol === 'Docente';
  const esEstudiante = usuario?.rol === 'Estudiante';

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
            {esEstudiante ? 'Mis Asignaturas Inscritas & Calificaciones' : esDocente ? 'Evaluación de Estudiantes' : 'Registro de Matrículas'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            {esEstudiante ? 'Consulta tus asignaturas actuales y tus notas parciales/finales' : esDocente ? 'Ingreso de calificaciones parciales y examen final' : 'Gestión de matriculaciones y actas de notas'}
          </p>
        </div>

        {/* Solo el Administrador ve el botón para registrar matrículas manuales desde esta pantalla */}
        {esAdmin && (
          <button className="btn btn-primary" onClick={abrirModalInscripcion}>
            <Plus size={18} /> Efectuar Matrícula
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Estudiante</th>
              <th>Cédula</th>
              <th>Asignatura</th>
              <th>P1 (30%)</th>
              <th>P2 (30%)</th>
              <th>EF (40%)</th>
              <th>Nota Final</th>
              <th>Estado</th>
              {!esEstudiante && <th style={{ textAlign: 'right' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>Cargando registros de matrícula...</td>
              </tr>
            ) : matriculas.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  {esEstudiante ? 'No estás inscrito en ninguna asignatura actualmente. ¡Ingresa a la sección "Asignaturas" para inscribirte!' : 'No hay registros de matrícula para mostrar.'}
                </td>
              </tr>
            ) : (
              matriculas.map((mat) => (
                <tr key={mat.id}>
                  <td>#{mat.id}</td>
                  <td style={{ fontWeight: '600' }}>
                    {mat.estudiante 
                      ? (mat.estudiante.nombre_completo || `${mat.estudiante.nombres || ''} ${mat.estudiante.apellidos || ''}`.trim() || `Estudiante #${mat.estudiante_id}`) 
                      : `Estudiante #${mat.estudiante_id}`}
                  </td>
                  <td><code>{mat.estudiante ? mat.estudiante.cedula : 'N/A'}</code></td>
                  <td>
                    {mat.asignatura ? (
                      <div>
                        <span style={{ fontWeight: '600', color: '#a5b4fc' }}>{mat.asignatura.codigo}</span> - {mat.asignatura.nombre}
                      </div>
                    ) : `Asignatura #${mat.asignatura_id}`}
                  </td>
                  <td style={{ color: '#9ca3af' }}>{mat.nota_primer_parcial ?? '-'}</td>
                  <td style={{ color: '#9ca3af' }}>{mat.nota_segundo_parcial ?? '-'}</td>
                  <td style={{ color: '#9ca3af' }}>{mat.nota_examen_final ?? '-'}</td>
                  <td>
                    {mat.nota_final !== null && mat.nota_final !== undefined ? (
                      <span style={{ fontWeight: '700', color: mat.nota_final >= 51 ? '#34d399' : '#f87171' }}>
                        {mat.nota_final} pts
                      </span>
                    ) : (
                      <span style={{ fontStyle: 'italic', color: '#6b7280' }}>Pendiente</span>
                    )}
                  </td>
                  <td>{obtenerInsigniaEstado(mat.estado)}</td>

                  {/* Acciones según el rol */}
                  {!esEstudiante && (
                    <td style={{ textAlign: 'right' }}>
                      {(esAdmin || esDocente) && (
                        <button 
                          className="btn btn-secondary btn-icon" 
                          onClick={() => abrirModalNotas(mat)}
                          title="Ingresar / Actualizar Calificaciones"
                          style={{ marginRight: '0.4rem' }}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {esAdmin && (
                        <button 
                          className="btn btn-danger btn-icon" 
                          onClick={() => cancelarMatricula(mat.id)}
                          title="Cancelar Matrícula"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Matricular Estudiante (Solo Admin) */}
      {esAdmin && (
        <VentanaModal
          estaAbierto={modalInscripcionAbierto}
          alCerrar={() => setModalInscripcionAbierto(false)}
          titulo="Matricular Estudiante en Asignatura"
        >
          <form onSubmit={matricularEstudiante}>
            <div className="form-group">
              <label>Seleccionar Estudiante Habilitado</label>
              <select
                className="form-control"
                required
                value={formularioInscripcion.estudiante_id}
                onChange={(e) => setFormularioInscripcion({ ...formularioInscripcion, estudiante_id: Number(e.target.value) })}
              >
                {estudiantes.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre_completo} - {est.cedula} (Semestre {est.semestre_actual})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Seleccionar Asignatura Ofertada</label>
              <select
                className="form-control"
                required
                value={formularioInscripcion.asignatura_id}
                onChange={(e) => setFormularioInscripcion({ ...formularioInscripcion, asignatura_id: Number(e.target.value) })}
              >
                {asignaturas.map((asig) => (
                  <option key={asig.id} value={asig.id} disabled={asig.estudiantes_inscritos >= asig.capacidad_maxima}>
                    {asig.codigo} - {asig.nombre} ({asig.estudiantes_inscritos}/{asig.capacidad_maxima} cupos)
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalInscripcionAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Confirmar Matrícula</button>
            </div>
          </form>
        </VentanaModal>
      )}

      {/* Modal: Ingresar Calificaciones (Admin & Docente) */}
      {(esAdmin || esDocente) && (
        <VentanaModal
          estaAbierto={modalNotasAbierto}
          alCerrar={() => setModalNotasAbierto(false)}
          titulo={`Ingresar Calificaciones: ${matriculaSeleccionada?.estudiante?.nombre_completo || ''}`}
        >
          <form onSubmit={guardarCalificaciones}>
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
              <button type="submit" className="btn btn-primary">Calcular & Guardar Nota</button>
            </div>
          </form>
        </VentanaModal>
      )}
    </div>
  );
};
