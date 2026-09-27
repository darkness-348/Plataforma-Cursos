from typing import Dict, Any
from app.domain.repositories.estudiante_repositorio import EstudianteRepositorio
from app.domain.repositories.docente_repositorio import DocenteRepositorio
from app.domain.repositories.carrera_repositorio import CarreraRepositorio
from app.domain.repositories.asignatura_repositorio import AsignaturaRepositorio
from app.domain.repositories.matricula_repositorio import MatriculaRepositorio

class PanelCasosUso:
    def __init__(
        self,
        estudiante_repo: EstudianteRepositorio,
        docente_repo: DocenteRepositorio,
        carrera_repo: CarreraRepositorio,
        asignatura_repo: AsignaturaRepositorio,
        matricula_repo: MatriculaRepositorio
    ):
        self.estudiante_repo = estudiante_repo
        self.docente_repo = docente_repo
        self.carrera_repo = carrera_repo
        self.asignatura_repo = asignatura_repo
        self.matricula_repo = matricula_repo

    def obtener_resumen_panel(self) -> Dict[str, Any]:
        total_estudiantes = self.estudiante_repo.contar()
        total_docentes = self.docente_repo.contar()
        total_carreras = self.carrera_repo.contar()
        total_asignaturas = self.asignatura_repo.contar()
        total_matriculas = self.matricula_repo.contar()

        estudiantes_recientes = self.estudiante_repo.obtener_todos(skip=0, limit=5)
        asignaturas_recientes = self.asignatura_repo.obtener_todas(skip=0, limit=5)

        return {
            "metricas": {
                "total_estudiantes": total_estudiantes,
                "total_docentes": total_docentes,
                "total_carreras": total_carreras,
                "total_asignaturas": total_asignaturas,
                "total_matriculas": total_matriculas
            },
            "estudiantes_recientes": estudiantes_recientes,
            "asignaturas_recientes": asignaturas_recientes
        }

    def obtener_reporte_decano(self) -> Dict[str, Any]:
        carreras = self.carrera_repo.obtener_todas(limit=1000)
        estudiantes = self.estudiante_repo.obtener_todos(limit=1000)
        asignaturas = self.asignatura_repo.obtener_todas(limit=1000)
        matriculas = self.matricula_repo.obtener_todas(limit=1000)

        reporte_carreras = []
        for car in carreras:
            ests_carrera = [e for e in estudiantes if e.carrera_id == car.id]
            asigs_carrera = [a for a in asignaturas if a.carrera_id == car.id]
            asig_ids = [a.id for a in asigs_carrera]
            mats_carrera = [m for m in matriculas if m.asignatura_id in asig_ids]

            total_ests = len(ests_carrera)
            activos = sum(1 for e in ests_carrera if e.estado == "Activo")
            promedio_carrera = round(sum(e.promedio_acumulado for e in ests_carrera) / total_ests, 2) if total_ests > 0 else 0.0

            aprobados = sum(1 for m in mats_carrera if m.nota_final and m.nota_final >= 51)
            total_evaluados = sum(1 for m in mats_carrera if m.nota_final is not None)
            tasa_aprobacion = round((aprobados / total_evaluados * 100), 1) if total_evaluados > 0 else 100.0

            reporte_carreras.append({
                "carrera_id": car.id,
                "codigo": car.codigo,
                "nombre": car.nombre,
                "facultad": car.facultad,
                "duracion_semestres": car.duracion_semestres,
                "total_estudiantes": total_ests,
                "estudiantes_activos": activos,
                "promedio_carrera": promedio_carrera,
                "total_asignaturas": len(asigs_carrera),
                "total_matriculas": len(mats_carrera),
                "tasa_aprobacion": tasa_aprobacion
            })

        return {
            "resumen_institucional": {
                "total_estudiantes": len(estudiantes),
                "total_carreras": len(carreras),
                "total_asignaturas": len(asignaturas),
                "total_matriculas": len(matriculas),
                "promedio_institucional": round(sum(e.promedio_acumulado for e in estudiantes) / len(estudiantes), 2) if estudiantes else 0.0
            },
            "reporte_carreras": reporte_carreras
        }

