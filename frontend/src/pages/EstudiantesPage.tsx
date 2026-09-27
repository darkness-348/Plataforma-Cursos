import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { Estudiante, Carrera } from '../types';
import { VentanaModal } from '../components/VentanaModal';
import { Search, UserPlus, Edit2, Trash2, AlertCircle } from 'lucide-react';

export const EstudiantesPage: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [estudianteEditando, setEstudianteEditando] = useState<Estudiante | null>(null);
  const [formulario, setFormulario] = useState({
    cedula: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    carrera_id: 1,
    semestre_actual: 1,
    estado: 'Activo'
  });

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [listaEstudiantes, listaCarreras] = await Promise.all([
        clienteApi.obtenerEstudiantes({ busqueda }),
        clienteApi.obtenerCarreras()
      ]);
      setEstudiantes(listaEstudiantes);
      setCarreras(listaCarreras);
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
    setEstudianteEditando(null);
    setFormulario({
      cedula: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      carrera_id: carreras.length > 0 ? carreras[0].id : 1,
      semestre_actual: 1,
      estado: 'Activo'
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (estudiante: Estudiante) => {
    setEstudianteEditando(estudiante);
    setFormulario({
      cedula: estudiante.cedula,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      correo: estudiante.correo,
      telefono: estudiante.telefono || '',
      carrera_id: estudiante.carrera_id,
      semestre_actual: estudiante.semestre_actual,
      estado: estudiante.estado
    });
    setModalAbierto(true);
  };

  const guardarEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...formulario,
        carrera_id: Number(formulario.carrera_id),
        semestre_actual: Number(formulario.semestre_actual)
      };

      if (estudianteEditando) {
        await clienteApi.actualizarEstudiante(estudianteEditando.id, payload);
      } else {
        await clienteApi.crearEstudiante(payload);
      }
      setModalAbierto(false);
      cargarDatos();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const eliminarEstudiante = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este estudiante?')) return;
    try {
      await clienteApi.eliminarEstudiante(id);
      cargarDatos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por cédula, nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={abrirModalCrear}>
          <UserPlus size={18} /> Registrar Estudiante
        </button>
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
              <th>Cédula</th>
              <th>Estudiante</th>
              <th>Correo Inst.</th>
              <th>Carrera</th>
              <th>Semestre</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Cargando lista de estudiantes...</td>
              </tr>
            ) : estudiantes.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No se encontraron estudiantes.</td>
              </tr>
            ) : (
              estudiantes.map((est) => (
                <tr key={est.id}>
                  <td>#{est.id}</td>
                  <td><code>{est.cedula}</code></td>
                  <td style={{ fontWeight: '600' }}>{est.nombre_completo}</td>
                  <td style={{ color: '#9ca3af' }}>{est.correo}</td>
                  <td>
                    <span className="badge badge-info">
                      {est.carrera ? est.carrera.nombre : `Carrera #${est.carrera_id}`}
                    </span>
                  </td>
                  <td>Semestre {est.semestre_actual}</td>
                  <td>
                    <span className={`badge ${est.estado === 'Activo' ? 'badge-active' : 'badge-inactive'}`}>
                      {est.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => abrirModalEditar(est)} style={{ marginRight: '0.4rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => eliminarEstudiante(est.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <VentanaModal
        estaAbierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo={estudianteEditando ? 'Editar Estudiante' : 'Nuevo Estudiante Universitario'}
      >
        <form onSubmit={guardarEstudiante}>
          <div className="form-row">
            <div className="form-group">
              <label>Cédula / Identificación</label>
              <input
                type="text"
                required
                className="form-control"
                value={formulario.cedula}
                onChange={(e) => setFormulario({ ...formulario, cedula: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Carrera Universitaria</label>
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
              <label>Nombres</label>
              <input
                type="text"
                required
                className="form-control"
                value={formulario.nombres}
                onChange={(e) => setFormulario({ ...formulario, nombres: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input
                type="text"
                required
                className="form-control"
                value={formulario.apellidos}
                onChange={(e) => setFormulario({ ...formulario, apellidos: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                required
                className="form-control"
                value={formulario.correo}
                onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                className="form-control"
                value={formulario.telefono}
                onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Semestre Actual</label>
              <input
                type="number"
                min="1"
                max="14"
                required
                className="form-control"
                value={formulario.semestre_actual}
                onChange={(e) => setFormulario({ ...formulario, semestre_actual: Number(e.target.value) })}
              />
            </div>
            {estudianteEditando && (
              <div className="form-group">
                <label>Estado</label>
                <select
                  className="form-control"
                  value={formulario.estado}
                  onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Graduado">Graduado</option>
                </select>
              </div>
            )}
          </div>

          {!estudianteEditando && (
            <div style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '1rem' }}>
              💡 <strong>Creación Automática de Cuenta:</strong> Al guardar el estudiante, se generará inmediatamente su cuenta de acceso con el correo ingresado y la contraseña inicial <code>estudiante123</code>.
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {estudianteEditando ? 'Guardar Cambios' : 'Crear Estudiante'}
            </button>
          </div>
        </form>
      </VentanaModal>
    </div>
  );
};
