import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { Docente } from '../types';
import { VentanaModal } from '../components/VentanaModal';
import { Search, UserPlus, Edit2, Trash2, AlertCircle, Award } from 'lucide-react';

export const DocentesPage: React.FC = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [docenteEditando, setDocenteEditando] = useState<Docente | null>(null);
  const [formulario, setFormulario] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    especialidad: '',
    grado_academico: 'Doctorado',
    tipo_contrato: 'Tiempo Completo',
    departamento: 'Ingeniería'
  });

  const cargarDocentes = async () => {
    setCargando(true);
    try {
      const datos = await clienteApi.obtenerDocentes({ busqueda });
      setDocentes(datos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, [busqueda]);

  const abrirModalCrear = () => {
    setDocenteEditando(null);
    setFormulario({
      dni: '',
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      especialidad: '',
      grado_academico: 'Doctorado',
      tipo_contrato: 'Tiempo Completo',
      departamento: 'Ingeniería'
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (docente: Docente) => {
    setDocenteEditando(docente);
    setFormulario({
      dni: docente.dni,
      nombres: docente.nombres,
      apellidos: docente.apellidos,
      correo: docente.correo,
      telefono: docente.telefono || '',
      especialidad: docente.especialidad,
      grado_academico: docente.grado_academico,
      tipo_contrato: docente.tipo_contrato,
      departamento: docente.departamento
    });
    setModalAbierto(true);
  };

  const guardarDocente = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (docenteEditando) {
        await clienteApi.actualizarDocente(docenteEditando.id, formulario);
      } else {
        await clienteApi.crearDocente(formulario);
      }
      setModalAbierto(false);
      cargarDocentes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const eliminarDocente = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este docente?')) return;
    try {
      await clienteApi.eliminarDocente(id);
      cargarDocentes();
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
            placeholder="Buscar por DNI, nombre o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={abrirModalCrear}>
          <UserPlus size={18} /> Registrar Docente
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
              <th>DNI</th>
              <th>Docente</th>
              <th>Correo Institucional</th>
              <th>Especialidad</th>
              <th>Grado Académico</th>
              <th>Contrato</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Cargando docentes...</td>
              </tr>
            ) : docentes.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No se encontraron docentes.</td>
              </tr>
            ) : (
              docentes.map((doc) => (
                <tr key={doc.id}>
                  <td>#{doc.id}</td>
                  <td><code>{doc.dni}</code></td>
                  <td style={{ fontWeight: '600' }}>{doc.nombre_completo}</td>
                  <td style={{ color: '#9ca3af' }}>{doc.correo}</td>
                  <td><span className="badge badge-info">{doc.especialidad}</span></td>
                  <td>
                    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Award size={13} /> {doc.grado_academico}
                    </span>
                  </td>
                  <td style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{doc.tipo_contrato}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => abrirModalEditar(doc)} style={{ marginRight: '0.4rem' }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => eliminarDocente(doc.id)}>
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
        titulo={docenteEditando ? 'Editar Docente' : 'Nuevo Docente Universitario'}
      >
        <form onSubmit={guardarDocente}>
          <div className="form-row">
            <div className="form-group">
              <label>DNI / Cédula</label>
              <input
                type="text"
                required
                className="form-control"
                value={formulario.dni}
                onChange={(e) => setFormulario({ ...formulario, dni: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Grado Académico</label>
              <select
                className="form-control"
                value={formulario.grado_academico}
                onChange={(e) => setFormulario({ ...formulario, grado_academico: e.target.value })}
              >
                <option value="Licenciatura">Licenciatura</option>
                <option value="Maestría">Maestría</option>
                <option value="Doctorado">Doctorado</option>
                <option value="Ph.D.">Ph.D.</option>
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
              <label>Especialidad Principal</label>
              <input
                type="text"
                required
                placeholder="Ej. Arquitectura de Software"
                className="form-control"
                value={formulario.especialidad}
                onChange={(e) => setFormulario({ ...formulario, especialidad: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Contrato</label>
              <select
                className="form-control"
                value={formulario.tipo_contrato}
                onChange={(e) => setFormulario({ ...formulario, tipo_contrato: e.target.value })}
              >
                <option value="Tiempo Completo">Tiempo Completo</option>
                <option value="Medio Tiempo">Medio Tiempo</option>
                <option value="Catedrático">Catedrático</option>
              </select>
            </div>
            <div className="form-group">
              <label>Departamento Académico</label>
              <input
                type="text"
                required
                className="form-control"
                value={formulario.departamento}
                onChange={(e) => setFormulario({ ...formulario, departamento: e.target.value })}
              />
            </div>
          </div>

          {!docenteEditando && (
            <div style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.6rem 0.8rem', borderRadius: '8px', marginBottom: '1rem', marginTop: '1rem' }}>
              💡 <strong>Creación Automática de Cuenta:</strong> Al guardar el docente, se creará inmediatamente su cuenta de acceso de usuario con el correo ingresado y la contraseña inicial <code>docente123</code>.
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {docenteEditando ? 'Guardar Cambios' : 'Crear Docente'}
            </button>
          </div>
        </form>
      </VentanaModal>
    </div>
  );
};
