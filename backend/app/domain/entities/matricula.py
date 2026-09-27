from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

@dataclass
class Matricula:
    id: Optional[int]
    estudiante_id: int
    asignatura_id: int
    fecha_matricula: date
    estado: str = "Inscrito" # Inscrito, Aprobado, Reprobado, Retirado
    nota_primer_parcial: Optional[float] = None
    nota_segundo_parcial: Optional[float] = None
    nota_examen_final: Optional[float] = None
    nota_final: Optional[float] = None
    fecha_creacion: Optional[datetime] = None

    def calcular_nota_final(self) -> Optional[float]:
        p1 = self.nota_primer_parcial or 0.0
        p2 = self.nota_segundo_parcial or 0.0
        ef = self.nota_examen_final or 0.0
        if self.nota_primer_parcial is not None or self.nota_segundo_parcial is not None or self.nota_examen_final is not None:
            self.nota_final = round((p1 * 0.3) + (p2 * 0.3) + (ef * 0.4), 2)
            if self.nota_final >= 51.0:
                self.estado = "Aprobado"
            else:
                self.estado = "Reprobado"
        return self.nota_final
