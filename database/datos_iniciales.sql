-- ============================================================
-- DATOS INICIALES DML: SISTEMA ACADÉMICO UNIVERSITARIO
-- ============================================================

INSERT INTO carreras (codigo, nombre, facultad, duracion_semestres, total_creditos, estado)
VALUES
('ING-SIS', 'Ingeniería de Sistemas', 'Facultad de Ingeniería y Tecnología', 10, 240, 'Activa'),
('CIE-DAT', 'Ciencia de Datos & IA', 'Facultad de Ciencias Exactas', 8, 200, 'Activa'),
('ING-IND', 'Ingeniería Industrial', 'Facultad de Ingeniería y Tecnología', 10, 230, 'Activa'),
('LIC-INF', 'Licenciatura en Informática', 'Facultad de Humanidades y Ciencias', 8, 180, 'Activa')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO docentes (dni, nombres, apellidos, correo, telefono, especialidad, grado_academico, tipo_contrato, departamento, estado)
VALUES
('1029384', 'Carlos Enrique', 'Mendoza Vaca', 'carlos.mendoza@universidad.edu', '71234567', 'Arquitectura de Software', 'Ph.D.', 'Tiempo Completo', 'Ingeniería de Software', 'Activo'),
('2938475', 'Ana María', 'Gutiérrez Paz', 'ana.gutierrez@universidad.edu', '72345678', 'Bases de Datos & Big Data', 'Doctorado', 'Tiempo Completo', 'Ciencias de la Computación', 'Activo'),
('3847561', 'Roberto Carlos', 'Silva Orellana', 'roberto.silva@universidad.edu', '73456789', 'Redes & Ciberseguridad', 'Maestría', 'Medio Tiempo', 'Infraestructura Tecnológica', 'Activo'),
('4756102', 'Elena Patricia', 'Fernández Ríos', 'elena.fernandez@universidad.edu', '74567890', 'Inteligencia Artificial', 'Ph.D.', 'Tiempo Completo', 'Inteligencia Artificial', 'Activo')
ON CONFLICT (dni) DO NOTHING;

INSERT INTO estudiantes (cedula, nombres, apellidos, correo, telefono, carrera_id, semestre_actual, estado, promedio_acumulado, creditos_aprobados, fecha_ingreso)
VALUES
('8492011', 'Juan Pablo', 'Rodríguez Claros', 'juan.rodriguez@estudiantes.edu', '78901234', 1, 6, 'Activo', 88.5, 120, '2023-02-01'),
('8492012', 'María José', 'Vargas Siles', 'maria.vargas@estudiantes.edu', '78901235', 1, 6, 'Activo', 92.0, 124, '2023-02-01'),
('8492013', 'Mateo Andrés', 'Quinteros Roca', 'mateo.quinteros@estudiantes.edu', '78901236', 2, 4, 'Activo', 84.0, 78, '2024-02-01'),
('8492014', 'Sofia Belén', 'Morales Justiniano', 'sofia.morales@estudiantes.edu', '78901237', 3, 8, 'Activo', 95.2, 170, '2022-08-01'),
('8492015', 'Lucas Mateo', 'Benítez Mercado', 'lucas.benitez@estudiantes.edu', '78901238', 1, 2, 'Activo', 79.5, 36, '2025-02-01')
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO asignaturas (codigo, nombre, creditos, carrera_id, docente_id, periodo_academico, capacidad_maxima, estudiantes_inscritos, aula, horario, estado)
VALUES
('SIS-301', 'Arquitectura Limpia & Patrones', 5, 1, 1, '2026-1', 30, 2, 'Lab Software 3', 'Lun/Mié 08:00 - 10:00', 'Abierto'),
('BD-202', 'Bases de Datos Avanzadas', 4, 1, 2, '2026-1', 25, 2, 'Lab Redes 1', 'Mar/Jue 10:00 - 12:00', 'Abierto'),
('RED-101', 'Redes y Comunicaciones', 4, 1, 3, '2026-1', 20, 1, 'Aula Magna B', 'Lun/Mié 14:00 - 16:00', 'Abierto'),
('IA-405', 'Machine Learning & Deep Learning', 5, 2, 4, '2026-1', 15, 1, 'Lab Computación Alto Rendimiento', 'Viernes 14:00 - 18:00', 'Abierto')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO matriculas (estudiante_id, asignatura_id, fecha_matricula, estado, nota_primer_parcial, nota_segundo_parcial, nota_examen_final, nota_final)
VALUES
(1, 1, '2026-02-10', 'Inscrito', 85.0, 90.0, 88.0, 87.7),
(1, 2, '2026-02-10', 'Inscrito', 92.0, 94.0, 95.0, 93.8),
(2, 1, '2026-02-11', 'Inscrito', 95.0, 96.0, 98.0, 96.5),
(3, 3, '2026-02-12', 'Inscrito', 78.0, 82.0, 85.0, 82.0),
(4, 4, '2026-02-12', 'Inscrito', 98.0, 99.0, 100.0, 99.1)
ON CONFLICT (estudiante_id, asignatura_id) DO NOTHING;
