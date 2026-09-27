export type RolUsuario = 'Rector' | 'Decano' | 'Administrador' | 'Docente' | 'Estudiante';

export interface Usuario {
  id: number;
  nombre_completo: string;
  correo: string;
  rol: RolUsuario | string;
  estudiante_id?: number;
  docente_id?: number;
  estado: string;
  fecha_creacion?: string;
}

export interface RespuestaLogin {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface PeticionRegistro {
  nombre_completo: string;
  correo: string;
  clave: string;
  rol: string;
  cedula_o_dni?: string;
  carrera_id?: number;
}

export interface PeticionLogin {
  correo: string;
  clave: string;
}

export interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
  facultad: string;
  duracion_semestres: number;
  total_creditos: number;
  estado: string;
  fecha_creacion?: string;
}

export interface Estudiante {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  carrera_id: number;
  carrera?: Carrera;
  semestre_actual: number;
  estado: string;
  promedio_acumulado: number;
  creditos_aprobados: number;
  fecha_ingreso?: string;
  fecha_creacion?: string;
}

export interface Docente {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  especialidad: string;
  grado_academico: string;
  tipo_contrato: string;
  departamento: string;
  estado: string;
  fecha_creacion?: string;
}

export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  creditos: number;
  semestre_nivel?: number;
  carrera_id: number;
  carrera?: Carrera;
  docente_id?: number;
  docente?: Docente;
  periodo_academico: string;
  capacidad_maxima: number;
  estudiantes_inscritos: number;
  aula?: string;
  horario?: string;
  estado: string;
  fecha_creacion?: string;
}

export interface Matricula {
  id: number;
  estudiante_id: number;
  asignatura_id: number;
  fecha_matricula: string;
  estado: string;
  nota_primer_parcial?: number;
  nota_segundo_parcial?: number;
  nota_examen_final?: number;
  nota_final?: number;
  estudiante?: Estudiante;
  asignatura?: Asignatura;
  fecha_creacion?: string;
}

export interface ResumenPanel {
  metricas: {
    total_estudiantes: number;
    total_docentes: number;
    total_carreras: number;
    total_asignaturas: number;
    total_matriculas: number;
  };
  estudiantes_recientes: Estudiante[];
  asignaturas_recientes: Asignatura[];
}

export interface CarreraReporte {
  carrera_id: number;
  codigo: string;
  nombre: string;
  facultad: string;
  duracion_semestres: number;
  total_estudiantes: number;
  estudiantes_activos: number;
  promedio_carrera: number;
  total_asignaturas: number;
  total_matriculas: number;
  tasa_aprobacion: number;
}

export interface ReporteDecanato {
  resumen_institucional: {
    total_estudiantes: number;
    total_carreras: number;
    total_asignaturas: number;
    total_matriculas: number;
    promedio_institucional: number;
  };
  reporte_carreras: CarreraReporte[];
}

export interface Aula {
  id: number;
  codigo: string;
  nombre: string;
  edificio: string;
  capacidad_maxima: number;
  tipo: string;
  estado: string;
  fecha_creacion?: string;
}

