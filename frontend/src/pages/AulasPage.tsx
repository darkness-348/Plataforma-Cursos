import React, { useEffect, useState } from 'react';
import { clienteApi } from '../api/cliente_api';
import { Aula } from '../types';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { VentanaModal } from '../components/VentanaModal';
import { TarjetaEstadistica } from '../components/TarjetaEstadistica';
import { 
  Building, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  MapPin, 
  Layers,
  Sparkles
} from 'lucide-react';

export const AulasPage: React.FC = () => {
  const { usuario } = useAutenticacion();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [aulaEditando, setAulaEditando] = useState<Aula | null>(null);
  const [formulario, setFormulario] = useState({
    codigo: '',
    nombre: '',
    edificio: 'Edificio de Tecnología',
    capacidad_maxima: 30,
    tipo: 'Laboratorio',
    estado: 'Disponible'
  });

  const cargarAulas = async () => {
    setCargando(true);
    try {
      const datos = await clienteApi.obtenerAulas();
      setAulas(datos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAulas();
  }, []);

  const abrirModalCrear = () => {
    setAulaEditando(null);
    setFormulario({
      codigo: '',
      nombre: '',
      edificio: 'Edificio de Tecnología',
      capacidad_maxima: 30,
      tipo: 'Laboratorio',
      estado: 'Disponible'
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (aula: Aula) => {
    setAulaEditando(aula);
    setFormulario({
      codigo: aula.codigo,
      nombre: aula.nombre,
      edificio: aula.edificio,
      capacidad_maxima: aula.capacidad_maxima,
      tipo: aula.tipo,
      estado: aula.estado
    });
    setModalAbierto(true);
  };

  const guardarAula = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);
    try {
      const payload = {
        ...formulario,
        capacidad_maxima: Number(formulario.capacidad_maxima)
      };

      if (aulaEditando) {
        await clienteApi.actualizarAula(aulaEditando.id, payload);
        setMensajeExito(`¡Aula '${formulario.nombre}' actualizada exitosamente!`);
      } else {
        const nueva = await clienteApi.crearAula(payload);
        setMensajeExito(`¡Aula '${nueva.nombre}' (${nueva.codigo}) agregada con capacidad para ${nueva.capacidad_maxima} personas!`);
      }
      setModalAbierto(false);
      cargarAulas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const eliminarAula = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este espacio académico?')) return;
    setError(null);
    try {
      await clienteApi.eliminarAula(id);
      setMensajeExito('Aula eliminada exitosamente.');
      cargarAulas();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const esGestionAcademica = usuario?.rol === 'Administrador' || usuario?.rol === 'Decano' || usuario?.rol === 'Rector';

  const aulasFiltradas = aulas.filter(a => 
    a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    a.edificio.toLowerCase().includes(busqueda.toLowerCase())
  );

  const capacidadTotal = aulas.reduce((acc, a) => acc + a.capacidad_maxima, 0);
  const totalLaboratorios = aulas.filter(a => a.tipo === 'Laboratorio').length;
  const totalAuditorios = aulas.filter(a => a.tipo === 'Auditorio').length;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={22} color="#818cf8" />
            Gestión de Aulas & Capacidad Física
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Control de espacios académicos, auditorios, laboratorios y aforo de estudiantes</p>
        </div>

        {esGestionAcademica && (
          <button className="btn btn-primary" onClick={abrirModalCrear}>
            <Plus size={18} /> + Nueva Aula
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

      {/* Métricas de Aulas y Capacidad */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <TarjetaEstadistica
          titulo="Total de Aulas Registradas"
          valor={aulas.length}
          icono={Building}
          color="#6366f1"
          colorFondo="rgba(99, 102, 241, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Capacidad Aforo Institucional"
          valor={`${capacidadTotal} personas`}
          icono={Users}
          color="#34d399"
          colorFondo="rgba(16, 185, 129, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Laboratorios Especializados"
          valor={totalLaboratorios}
          icono={Layers}
          color="#fbbf24"
          colorFondo="rgba(245, 158, 11, 0.15)"
        />
        <TarjetaEstadistica
          titulo="Auditorios & Aulas Magnas"
          valor={totalAuditorios}
          icono={Sparkles}
          color="#c084fc"
          colorFondo="rgba(168, 85, 247, 0.15)"
        />
      </div>

      <div className="search-box" style={{ marginBottom: '1.25rem', maxWidth: '400px' }}>
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por código, nombre o edificio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre del Aula / Laboratorio</th>
              <th>Edificio / Ubicación</th>
              <th>Tipo de Espacio</th>
              <th>Capacidad Máxima (Aforo)</th>
              <th>Estado</th>
              {esGestionAcademica && <th style={{ textAlign: 'right' }}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Cargando catálogo de aulas...</td>
              </tr>
            ) : aulasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  No se encontraron aulas registradas.
                </td>
              </tr>
            ) : (
              aulasFiltradas.map((aula) => (
                <tr key={aula.id}>
                  <td><code>{aula.codigo}</code></td>
                  <td style={{ fontWeight: '600' }}>{aula.nombre}</td>
                  <td style={{ color: '#9ca3af', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} color="#818cf8" /> {aula.edificio}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info">{aula.tipo}</span>
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      <Users size={13} style={{ marginRight: '4px' }} /> {aula.capacidad_maxima} Alumnos
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${aula.estado === 'Disponible' ? 'badge-active' : 'badge-inactive'}`}>
                      {aula.estado}
                    </span>
                  </td>
                  {esGestionAcademica && (
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-icon" onClick={() => abrirModalEditar(aula)} style={{ marginRight: '0.4rem' }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => eliminarAula(aula.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear / Editar Aula */}
      {esGestionAcademica && (
        <VentanaModal
          estaAbierto={modalAbierto}
          alCerrar={() => setModalAbierto(false)}
          titulo={aulaEditando ? 'Editar Aula / Espacio Académico' : 'Nueva Aula o Laboratorio'}
        >
          <form onSubmit={guardarAula}>
            <div className="form-row">
              <div className="form-group">
                <label>Código Identificador</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. LAB-101, AUD-201"
                  className="form-control"
                  value={formulario.codigo}
                  onChange={(e) => setFormulario({ ...formulario, codigo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Capacidad Máxima (Aforo de Alumnos)</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  required
                  className="form-control"
                  value={formulario.capacidad_maxima}
                  onChange={(e) => setFormulario({ ...formulario, capacidad_maxima: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nombre del Aula o Espacio</label>
              <input
                type="text"
                required
                placeholder="Ej. Lab Software 1 - Inteligencia Artificial"
                className="form-control"
                value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Edificio o Ubicación Física</label>
              <input
                type="text"
                required
                placeholder="Ej. Edificio de Tecnología, Bloque Central"
                className="form-control"
                value={formulario.edificio}
                onChange={(e) => setFormulario({ ...formulario, edificio: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Espacio</label>
                <select
                  className="form-control"
                  value={formulario.tipo}
                  onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                >
                  <option value="Laboratorio">Laboratorio Especializado</option>
                  <option value="Aula Teórica">Aula Teórica Regular</option>
                  <option value="Auditorio">Auditorio / Aula Magna</option>
                  <option value="Taller">Taller Práctico</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado de Disponibilidad</label>
                <select
                  className="form-control"
                  value={formulario.estado}
                  onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="Mantenimiento">En Mantenimiento</option>
                  <option value="Ocupado">Ocupado / Reservado</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {aulaEditando ? 'Guardar Cambios' : 'Crear Aula'}
              </button>
            </div>
          </form>
        </VentanaModal>
      )}
    </div>
  );
};
