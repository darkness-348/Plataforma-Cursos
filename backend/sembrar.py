from datetime import date
from app.infrastructure.database.sesion import SesionLocal, Base, motor_bd
from app.infrastructure.database.models.carrera_modelo import CarreraModelo
from app.infrastructure.database.models.docente_modelo import DocenteModelo
from app.infrastructure.database.models.estudiante_modelo import EstudianteModelo
from app.infrastructure.database.models.asignatura_modelo import AsignaturaModelo
from app.infrastructure.database.models.matricula_modelo import MatriculaModelo
from app.infrastructure.database.models.usuario_modelo import UsuarioModelo
from app.infrastructure.database.models.aula_modelo import AulaModelo
from app.application.seguridad import obtener_hash_clave

def sembrar_datos():
    print("Iniciando sembrado de datos institucionales y usuarios...")
    Base.metadata.create_all(bind=motor_bd)
    bd = SesionLocal()

    try:
        if bd.query(CarreraModelo).count() > 0:
            print("La base de datos ya contiene información. Sembrado omitido.")
            return

        # 0. Crear Aulas Físicas con Capacidad
        aulas = [
            AulaModelo(codigo="LAB-101", nombre="Lab Software 1", edificio="Edificio de Tecnología", capacidad_maxima=30, tipo="Laboratorio", estado="Disponible"),
            AulaModelo(codigo="LAB-102", nombre="Lab Data Science & IA", edificio="Edificio de Tecnología", capacidad_maxima=35, tipo="Laboratorio", estado="Disponible"),
            AulaModelo(codigo="AUL-201", nombre="Aula Magna Central", edificio="Bloque Central", capacidad_maxima=200, tipo="Auditorio", estado="Disponible"),
            AulaModelo(codigo="AUD-301", nombre="Auditorio Decanato", edificio="Edificio Administrativo", capacidad_maxima=150, tipo="Auditorio", estado="Disponible"),
            AulaModelo(codigo="TAL-105", nombre="Taller de Robótica & Mecatrónica", edificio="Edificio de Ciencias", capacidad_maxima=25, tipo="Taller", estado="Disponible"),
            AulaModelo(codigo="AUL-102", nombre="Aula Teórica 102", edificio="Bloque A", capacidad_maxima=45, tipo="Aula Teórica", estado="Disponible")
        ]
        bd.add_all(aulas)
        bd.commit()
        print("Aulas universitarias con capacidad insertadas.")

        # 1. Crear Carreras Universitarias
        carreras = [
            CarreraModelo(codigo="ING-SIS", nombre="Ingeniería de Sistemas", facultad="Facultad de Ingeniería y Tecnología", duracion_semestres=10, total_creditos=240, estado="Activa"),
            CarreraModelo(codigo="CIE-DAT", nombre="Ciencia de Datos & IA", facultad="Facultad de Ciencias Exactas", duracion_semestres=8, total_creditos=200, estado="Activa"),
            CarreraModelo(codigo="ING-IND", nombre="Ingeniería Industrial", facultad="Facultad de Ingeniería y Tecnología", duracion_semestres=10, total_creditos=230, estado="Activa"),
            CarreraModelo(codigo="LIC-INF", nombre="Licenciatura en Informática", facultad="Facultad de Humanidades y Ciencias", duracion_semestres=8, total_creditos=180, estado="Activa")
        ]
        bd.add_all(carreras)
        bd.commit()
        print("Carreras universitarias insertadas.")

        # 2. Crear Docentes
        docentes = [
            DocenteModelo(dni="1029384", nombres="Carlos Enrique", apellidos="Mendoza Vaca", correo="carlos.mendoza@universidad.edu", telefono="71234567", especialidad="Arquitectura de Software", grado_academico="Ph.D.", tipo_contrato="Tiempo Completo", departamento="Ingeniería de Software"),
            DocenteModelo(dni="2938475", nombres="Ana María", apellidos="Gutiérrez Paz", correo="ana.gutierrez@universidad.edu", telefono="72345678", especialidad="Bases de Datos & Big Data", grado_academico="Doctorado", tipo_contrato="Tiempo Completo", departamento="Ciencias de la Computación"),
            DocenteModelo(dni="3847561", nombres="Roberto Carlos", apellidos="Silva Orellana", correo="roberto.silva@universidad.edu", telefono="73456789", especialidad="Redes & Ciberseguridad", grado_academico="Maestría", tipo_contrato="Medio Tiempo", departamento="Infraestructura Tecnológica"),
            DocenteModelo(dni="4756102", nombres="Elena Patricia", apellidos="Fernández Ríos", correo="elena.fernandez@universidad.edu", telefono="74567890", especialidad="Inteligencia Artificial", grado_academico="Ph.D.", tipo_contrato="Tiempo Completo", departamento="Inteligencia Artificial")
        ]
        bd.add_all(docentes)
        bd.commit()
        print("Docentes académicos insertados.")

        # 3. Crear Estudiantes
        estudiantes = [
            EstudianteModelo(cedula="8492011", nombres="Juan Pablo", apellidos="Rodríguez Claros", correo="juan.rodriguez@estudiantes.edu", telefono="78901234", carrera_id=carreras[0].id, semestre_actual=6, estado="Activo", promedio_acumulado=88.5, creditos_aprobados=120, fecha_ingreso=date(2023, 2, 1)),
            EstudianteModelo(cedula="8492012", nombres="María José", apellidos="Vargas Siles", correo="maria.vargas@estudiantes.edu", telefono="78901235", carrera_id=carreras[0].id, semestre_actual=6, estado="Activo", promedio_acumulado=92.0, creditos_aprobados=124, fecha_ingreso=date(2023, 2, 1)),
            EstudianteModelo(cedula="8492013", nombres="Mateo Andrés", apellidos="Quinteros Roca", correo="mateo.quinteros@estudiantes.edu", telefono="78901236", carrera_id=carreras[1].id, semestre_actual=4, estado="Activo", promedio_acumulado=84.0, creditos_aprobados=78, fecha_ingreso=date(2024, 2, 1)),
            EstudianteModelo(cedula="8492014", nombres="Sofia Belén", apellidos="Morales Justiniano", correo="sofia.morales@estudiantes.edu", telefono="78901237", carrera_id=carreras[2].id, semestre_actual=8, estado="Activo", promedio_acumulado=95.2, creditos_aprobados=170, fecha_ingreso=date(2022, 8, 1)),
            EstudianteModelo(cedula="8492015", nombres="Lucas Mateo", apellidos="Benítez Mercado", correo="lucas.benitez@estudiantes.edu", telefono="78901238", carrera_id=carreras[0].id, semestre_actual=2, estado="Activo", promedio_acumulado=79.5, creditos_aprobados=36, fecha_ingreso=date(2025, 2, 1))
        ]
        bd.add_all(estudiantes)
        bd.commit()
        print("Estudiantes universitarios insertados.")

        # 4. Crear Asignaturas de las Mallas Curriculares (organizadas por Carrera y Semestre)
        asignaturas = [
            # ----------------------------------------------------
            # Malla 1: Ingeniería de Sistemas (ING-SIS - Carrera 1)
            # ----------------------------------------------------
            # Semestre 1
            AsignaturaModelo(codigo="SIS-101", nombre="Programación Orientada a Objetos I", creditos=4, carrera_id=carreras[0].id, semestre_nivel=1, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=0, aula="Lab Software 1", horario="Lun/Mié 08:00 - 10:00", estado="Abierto"),
            AsignaturaModelo(codigo="SIS-102", nombre="Cálculo I & Álgebra Lineal", creditos=4, carrera_id=carreras[0].id, semestre_nivel=1, docente_id=docentes[1].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=0, aula="Aula 102", horario="Mar/Jue 08:00 - 10:00", estado="Abierto"),
            # Semestre 2
            AsignaturaModelo(codigo="SIS-201", nombre="Estructuras de Datos & Algoritmos", creditos=5, carrera_id=carreras[0].id, semestre_nivel=2, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=1, aula="Lab Software 2", horario="Lun/Mié 10:00 - 12:00", estado="Abierto"),
            AsignaturaModelo(codigo="SIS-202", nombre="Arquitectura de Computadores", creditos=4, carrera_id=carreras[0].id, semestre_nivel=2, docente_id=docentes[2].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=1, aula="Lab Hardware 1", horario="Mar/Jue 10:00 - 12:00", estado="Abierto"),
            # Semestre 6
            AsignaturaModelo(codigo="SIS-601", nombre="Arquitectura Limpia & Patrones de Software", creditos=5, carrera_id=carreras[0].id, semestre_nivel=6, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=2, aula="Lab Software 3", horario="Lun/Mié 14:00 - 16:00", estado="Abierto"),
            AsignaturaModelo(codigo="SIS-602", nombre="Bases de Datos Avanzadas & SQL", creditos=4, carrera_id=carreras[0].id, semestre_nivel=6, docente_id=docentes[1].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=2, aula="Lab Redes 1", horario="Mar/Jue 14:00 - 16:00", estado="Abierto"),
            AsignaturaModelo(codigo="SIS-603", nombre="Redes & Seguridad Informática", creditos=4, carrera_id=carreras[0].id, semestre_nivel=6, docente_id=docentes[2].id, periodo_academico="2026-1", capacidad_maxima=20, estudiantes_inscritos=2, aula="Aula Magna B", horario="Viernes 08:00 - 12:00", estado="Abierto"),
            AsignaturaModelo(codigo="SIS-604", nombre="Ingeniería de Software II & Scrum", creditos=5, carrera_id=carreras[0].id, semestre_nivel=6, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=2, aula="Aula 204", horario="Viernes 14:00 - 18:00", estado="Abierto"),

            # ----------------------------------------------------
            # Malla 2: Ciencia de Datos & IA (CIE-DAT - Carrera 2)
            # ----------------------------------------------------
            # Semestre 1
            AsignaturaModelo(codigo="DAT-101", nombre="Introducción a Data Science & Python", creditos=4, carrera_id=carreras[1].id, semestre_nivel=1, docente_id=docentes[3].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=0, aula="Lab IA 1", horario="Lun/Mié 08:00 - 10:00", estado="Abierto"),
            AsignaturaModelo(codigo="DAT-102", nombre="Álgebra Matricial & Computacional", creditos=4, carrera_id=carreras[1].id, semestre_nivel=1, docente_id=docentes[1].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=0, aula="Aula 301", horario="Mar/Jue 08:00 - 10:00", estado="Abierto"),
            # Semestre 4
            AsignaturaModelo(codigo="DAT-401", nombre="Machine Learning & Deep Learning", creditos=5, carrera_id=carreras[1].id, semestre_nivel=4, docente_id=docentes[3].id, periodo_academico="2026-1", capacidad_maxima=15, estudiantes_inscritos=1, aula="Lab IA 2", horario="Viernes 14:00 - 18:00", estado="Abierto"),
            AsignaturaModelo(codigo="DAT-402", nombre="Minería de Datos & Big Data Analytics", creditos=5, carrera_id=carreras[1].id, semestre_nivel=4, docente_id=docentes[3].id, periodo_academico="2026-1", capacidad_maxima=20, estudiantes_inscritos=1, aula="Lab Alto Rendimiento", horario="Lun/Mié 10:00 - 12:00", estado="Abierto"),
            AsignaturaModelo(codigo="DAT-403", nombre="Visión por Computador & NLP", creditos=5, carrera_id=carreras[1].id, semestre_nivel=4, docente_id=docentes[3].id, periodo_academico="2026-1", capacidad_maxima=15, estudiantes_inscritos=1, aula="Lab IA 2", horario="Viernes 08:00 - 12:00", estado="Abierto"),

            # ----------------------------------------------------
            # Malla 3: Ingeniería Industrial (ING-IND - Carrera 3)
            # ----------------------------------------------------
            # Semestre 1
            AsignaturaModelo(codigo="IND-101", nombre="Introducción a la Ingeniería Industrial", creditos=4, carrera_id=carreras[2].id, semestre_nivel=1, docente_id=docentes[2].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=0, aula="Aula Industrial 1", horario="Lun/Mié 08:00 - 10:00", estado="Abierto"),
            # Semestre 8
            AsignaturaModelo(codigo="IND-801", nombre="Investigación de Operaciones II", creditos=5, carrera_id=carreras[2].id, semestre_nivel=8, docente_id=docentes[2].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=1, aula="Aula Industrial 2", horario="Mar/Jue 08:00 - 10:00", estado="Abierto"),
            AsignaturaModelo(codigo="IND-802", nombre="Logística & Cadena de Suministros Global", creditos=5, carrera_id=carreras[2].id, semestre_nivel=8, docente_id=docentes[2].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=1, aula="Lab Logística", horario="Lun/Mié 10:00 - 12:00", estado="Abierto"),
            AsignaturaModelo(codigo="IND-803", nombre="Simulación de Sistemas Industriales", creditos=5, carrera_id=carreras[2].id, semestre_nivel=8, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=1, aula="Lab Simulación", horario="Mar/Jue 10:00 - 12:00", estado="Abierto"),

            # ----------------------------------------------------
            # Malla 4: Licenciatura en Informática (LIC-INF - Carrera 4)
            # ----------------------------------------------------
            # Semestre 1
            AsignaturaModelo(codigo="INF-101", nombre="Fundamentos de Programación & Algoritmos", creditos=4, carrera_id=carreras[3].id, semestre_nivel=1, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=0, aula="Lab Info 1", horario="Lun/Mié 08:00 - 10:00", estado="Abierto"),
            AsignaturaModelo(codigo="INF-102", nombre="Análisis & Diseño de Sistemas", creditos=5, carrera_id=carreras[3].id, semestre_nivel=1, docente_id=docentes[1].id, periodo_academico="2026-1", capacidad_maxima=30, estudiantes_inscritos=0, aula="Lab Info 2", horario="Mar/Jue 08:00 - 10:00", estado="Abierto"),
            AsignaturaModelo(codigo="INF-103", nombre="Desarrollo Web Fullstack & APIs", creditos=5, carrera_id=carreras[3].id, semestre_nivel=1, docente_id=docentes[0].id, periodo_academico="2026-1", capacidad_maxima=25, estudiantes_inscritos=0, aula="Lab Web 1", horario="Lun/Mié 10:00 - 12:00", estado="Abierto"),
            AsignaturaModelo(codigo="INF-104", nombre="Informática Forense & Peritaje Digital", creditos=4, carrera_id=carreras[3].id, semestre_nivel=1, docente_id=docentes[2].id, periodo_academico="2026-1", capacidad_maxima=20, estudiantes_inscritos=0, aula="Lab Forense", horario="Viernes 14:00 - 18:00", estado="Abierto")
        ]
        bd.add_all(asignaturas)
        bd.commit()
        print("Asignaturas de las Mallas Curriculares insertadas.")

        # 5. Crear Matrículas Iniciales (coincidentes con el semestre del estudiante)
        matriculas = [
            # Estudiante 1 (Juan Rodríguez - Semestre 6 Sistemas)
            MatriculaModelo(estudiante_id=estudiantes[0].id, asignatura_id=asignaturas[4].id, fecha_matricula=date(2026, 2, 10), estado="Inscrito", nota_primer_parcial=85.0, nota_segundo_parcial=90.0, nota_examen_final=88.0, nota_final=87.7),
            MatriculaModelo(estudiante_id=estudiantes[0].id, asignatura_id=asignaturas[5].id, fecha_matricula=date(2026, 2, 10), estado="Inscrito", nota_primer_parcial=92.0, nota_segundo_parcial=94.0, nota_examen_final=95.0, nota_final=93.8),
            # Estudiante 2 (María Vargas - Semestre 6 Sistemas)
            MatriculaModelo(estudiante_id=estudiantes[1].id, asignatura_id=asignaturas[4].id, fecha_matricula=date(2026, 2, 11), estado="Inscrito", nota_primer_parcial=95.0, nota_segundo_parcial=96.0, nota_examen_final=98.0, nota_final=96.5),
            # Estudiante 3 (Mateo Quinteros - Semestre 4 Ciencia de Datos)
            MatriculaModelo(estudiante_id=estudiantes[2].id, asignatura_id=asignaturas[10].id, fecha_matricula=date(2026, 2, 12), estado="Inscrito", nota_primer_parcial=78.0, nota_segundo_parcial=82.0, nota_examen_final=85.0, nota_final=82.0),
            # Estudiante 4 (Sofia Morales - Semestre 8 Industrial)
            MatriculaModelo(estudiante_id=estudiantes[3].id, asignatura_id=asignaturas[14].id, fecha_matricula=date(2026, 2, 12), estado="Inscrito", nota_primer_parcial=98.0, nota_segundo_parcial=99.0, nota_examen_final=100.0, nota_final=99.1),
            # Estudiante 5 (Lucas Benítez - Semestre 2 Sistemas)
            MatriculaModelo(estudiante_id=estudiantes[4].id, asignatura_id=asignaturas[2].id, fecha_matricula=date(2026, 2, 12), estado="Inscrito", nota_primer_parcial=80.0, nota_segundo_parcial=85.0, nota_examen_final=88.0, nota_final=84.5)
        ]
        bd.add_all(matriculas)
        bd.commit()
        print("Matrículas universitarias insertadas.")

        # 6. Crear Cuentas de Usuarios con Roles para Login (Rector, Decano, Administrador, Docente, Estudiante)
        usuarios = [
            UsuarioModelo(
                nombre_completo="Dr. Fernando Valenzuela (Rector Magnífico)",
                correo="rector@universidad.edu",
                clave_hash=obtener_hash_clave("rector123"),
                rol="Rector",
                estado="Activo"
            ),
            UsuarioModelo(
                nombre_completo="Dra. Beatriz Morales (Decana de Facultad)",
                correo="decano.sistemas@universidad.edu",
                clave_hash=obtener_hash_clave("decano123"),
                rol="Decano",
                estado="Activo"
            ),
            UsuarioModelo(
                nombre_completo="Administrador General",
                correo="admin@universidad.edu",
                clave_hash=obtener_hash_clave("admin123"),
                rol="Administrador",
                estado="Activo"
            ),
            UsuarioModelo(
                nombre_completo="Prof. Carlos Mendoza",
                correo="carlos.mendoza@universidad.edu",
                clave_hash=obtener_hash_clave("docente123"),
                rol="Docente",
                docente_id=docentes[0].id,
                estado="Activo"
            ),
            UsuarioModelo(
                nombre_completo="Juan Pablo Rodríguez",
                correo="juan.rodriguez@estudiantes.edu",
                clave_hash=obtener_hash_clave("estudiante123"),
                rol="Estudiante",
                estudiante_id=estudiantes[0].id,
                estado="Activo"
            )
        ]
        bd.add_all(usuarios)
        bd.commit()
        print("Cuentas de usuario de prueba (Rector, Decano, Admin, Docente, Estudiante) creadas con éxito.")

        print("¡Base de datos sembrada correctamente!")

    except Exception as e:
        print(f"Error al sembrar datos: {e}")
        bd.rollback()
    finally:
        bd.close()

if __name__ == "__main__":
    sembrar_datos()
