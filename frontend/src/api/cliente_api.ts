import {
  Carrera,
  Estudiante,
  Docente,
  Asignatura,
  Matricula,
  ResumenPanel,
  Usuario,
  RespuestaLogin,
  PeticionRegistro,
  PeticionLogin,
  ReporteDecanato,
  Aula
} from '../types';

const URL_BASE_API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function obtenerTokenSesion(): string | null {
  return localStorage.getItem('token_academico_jwt');
}

async function realizarPeticion<T>(endpoint: string, opciones: RequestInit = {}): Promise<T> {
  const url = `${URL_BASE_API}${endpoint}`;
  const token = obtenerTokenSesion();

  const encabezados: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opciones.headers as Record<string, string>),
  };

  if (token) {
    encabezados['Authorization'] = `Bearer ${token}`;
  }

  const configuracion: RequestInit = {
    ...opciones,
    headers: encabezados,
  };

  try {
    const respuesta = await fetch(url, configuracion);

    if (respuesta.status === 204) {
      return true as unknown as T;
    }

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      const mensajeError = datos.detail || 'Ocurrió un error inesperado en el servidor.';
      throw new Error(mensajeError);
    }

    return datos as T;
  } catch (error: any) {
    console.error(`Error de API [${endpoint}]:`, error);
    throw error;
  }
}

export const clienteApi = {

  iniciarSesion: (datos: PeticionLogin) =>
    realizarPeticion<RespuestaLogin>('/auth/login', { method: 'POST', body: JSON.stringify(datos) }),

  registrarUsuario: (datos: PeticionRegistro) =>
    realizarPeticion<Usuario>('/auth/registro', { method: 'POST', body: JSON.stringify(datos) }),

  obtenerPerfilUsuario: () =>
    realizarPeticion<Usuario>('/auth/perfil'),

  obtenerResumenPanel: () => realizarPeticion<ResumenPanel>('/panel/resumen'),
  obtenerReporteDecanato: () => realizarPeticion<ReporteDecanato>('/panel/reporte-decanato'),


  obtenerCarreras: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return realizarPeticion<Carrera[]>(`/carreras/${query ? `?${query}` : ''}`);
  },
  obtenerCarreraPorId: (id: number) => realizarPeticion<Carrera>(`/carreras/${id}`),
  crearCarrera: (datos: Partial<Carrera>) => realizarPeticion<Carrera>('/carreras/', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarCarrera: (id: number, datos: Partial<Carrera>) => realizarPeticion<Carrera>(`/carreras/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarCarrera: (id: number) => realizarPeticion<boolean>(`/carreras/${id}`, { method: 'DELETE' }),


  obtenerEstudiantes: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return realizarPeticion<Estudiante[]>(`/estudiantes/${query ? `?${query}` : ''}`);
  },
  obtenerEstudiantePorId: (id: number) => realizarPeticion<Estudiante>(`/estudiantes/${id}`),
  crearEstudiante: (datos: Partial<Estudiante>) => realizarPeticion<Estudiante>('/estudiantes/', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarEstudiante: (id: number, datos: Partial<Estudiante>) => realizarPeticion<Estudiante>(`/estudiantes/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarEstudiante: (id: number) => realizarPeticion<boolean>(`/estudiantes/${id}`, { method: 'DELETE' }),


  obtenerDocentes: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return realizarPeticion<Docente[]>(`/docentes/${query ? `?${query}` : ''}`);
  },
  obtenerDocentePorId: (id: number) => realizarPeticion<Docente>(`/docentes/${id}`),
  crearDocente: (datos: Partial<Docente>) => realizarPeticion<Docente>('/docentes/', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarDocente: (id: number, datos: Partial<Docente>) => realizarPeticion<Docente>(`/docentes/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarDocente: (id: number) => realizarPeticion<boolean>(`/docentes/${id}`, { method: 'DELETE' }),


  obtenerAsignaturas: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return realizarPeticion<Asignatura[]>(`/asignaturas/${query ? `?${query}` : ''}`);
  },
  obtenerAsignaturaPorId: (id: number) => realizarPeticion<Asignatura>(`/asignaturas/${id}`),
  crearAsignatura: (datos: Partial<Asignatura>) => realizarPeticion<Asignatura>('/asignaturas/', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarAsignatura: (id: number, datos: Partial<Asignatura>) => realizarPeticion<Asignatura>(`/asignaturas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarAsignatura: (id: number) => realizarPeticion<boolean>(`/asignaturas/${id}`, { method: 'DELETE' }),


  obtenerMatriculas: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return realizarPeticion<Matricula[]>(`/matriculas/${query ? `?${query}` : ''}`);
  },
  obtenerMatriculaPorId: (id: number) => realizarPeticion<Matricula>(`/matriculas/${id}`),
  crearMatricula: (datos: Partial<Matricula>) => realizarPeticion<Matricula>('/matriculas/', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarMatricula: (id: number, datos: Partial<Matricula>) => realizarPeticion<Matricula>(`/matriculas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarMatricula: (id: number) => realizarPeticion<boolean>(`/matriculas/${id}`, { method: 'DELETE' }),


  obtenerAulas: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return realizarPeticion<Aula[]>(`/aulas/${query ? `?${query}` : ''}`);
  },
  obtenerAulaPorId: (id: number) => realizarPeticion<Aula>(`/aulas/${id}`),
  crearAula: (datos: Partial<Aula>) => realizarPeticion<Aula>('/aulas/', { method: 'POST', body: JSON.stringify(datos) }),
  actualizarAula: (id: number, datos: Partial<Aula>) => realizarPeticion<Aula>(`/aulas/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminarAula: (id: number) => realizarPeticion<boolean>(`/aulas/${id}`, { method: 'DELETE' }),
};
