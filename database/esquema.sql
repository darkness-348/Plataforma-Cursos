-- ============================================================
-- ESQUEMA DDL: SISTEMA DE GESTIÓN ACADÉMICA UNIVERSITARIA
-- Base de Datos: PostgreSQL 16 / SQLite Compatible
-- ============================================================

-- Tabla: carreras
CREATE TABLE IF NOT EXISTS carreras (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    facultad VARCHAR(150) NOT NULL,
    duracion_semestres INT DEFAULT 10 NOT NULL,
    total_creditos INT DEFAULT 220 NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activa' NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE RESTRICT,
    semestre_actual INT DEFAULT 1 NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo' NOT NULL,
    promedio_acumulado NUMERIC(4,2) DEFAULT 0.0 NOT NULL,
    creditos_aprobados INT DEFAULT 0 NOT NULL,
    fecha_ingreso DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: docentes
CREATE TABLE IF NOT EXISTS docentes (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    especialidad VARCHAR(100) NOT NULL,
    grado_academico VARCHAR(50) NOT NULL,
    tipo_contrato VARCHAR(50) DEFAULT 'Tiempo Completo' NOT NULL,
    departamento VARCHAR(100) DEFAULT 'Ingeniería' NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo' NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: asignaturas
CREATE TABLE IF NOT EXISTS asignaturas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    creditos INT NOT NULL CHECK (creditos >= 1),
    carrera_id INT NOT NULL REFERENCES carreras(id) ON DELETE CASCADE,
    docente_id INT REFERENCES docentes(id) ON DELETE SET NULL,
    periodo_academico VARCHAR(20) DEFAULT '2026-1' NOT NULL,
    capacidad_maxima INT DEFAULT 30 NOT NULL CHECK (capacidad_maxima >= 1),
    estudiantes_inscritos INT DEFAULT 0 NOT NULL,
    aula_id INT REFERENCES aulas(id) ON DELETE SET NULL,
    aula VARCHAR(50),
    horario VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'Abierto' NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: matriculas
CREATE TABLE IF NOT EXISTS matriculas (
    id SERIAL PRIMARY KEY,
    estudiante_id INT NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    asignatura_id INT NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    fecha_matricula DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Inscrito' NOT NULL,
    nota_primer_parcial NUMERIC(5,2),
    nota_segundo_parcial NUMERIC(5,2),
    nota_examen_final NUMERIC(5,2),
    nota_final NUMERIC(5,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_estudiante_asignatura UNIQUE (estudiante_id, asignatura_id)
);

-- Tabla: usuarios (Autenticación JWT Bearer y Roles RBAC)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    clave_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'Estudiante' NOT NULL,
    estudiante_id INT REFERENCES estudiantes(id) ON DELETE SET NULL,
    docente_id INT REFERENCES docentes(id) ON DELETE SET NULL,
    estado VARCHAR(20) DEFAULT 'Activo' NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_estudiantes_cedula ON estudiantes(cedula);
CREATE INDEX IF NOT EXISTS idx_estudiantes_correo ON estudiantes(correo);
CREATE INDEX IF NOT EXISTS idx_docentes_dni ON docentes(dni);
CREATE INDEX IF NOT EXISTS idx_carreras_codigo ON carreras(codigo);
CREATE INDEX IF NOT EXISTS idx_asignaturas_codigo ON asignaturas(codigo);
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_asignatura ON matriculas(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(correo);
