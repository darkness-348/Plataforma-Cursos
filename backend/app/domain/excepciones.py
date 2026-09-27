class ExcepcionDominio(Exception):
    """Excepción base para el dominio del sistema académico."""
    pass

class EntidadNoEncontradaExcepcion(ExcepcionDominio):
    """Excepción cuando una entidad no se encuentra en el sistema."""
    def __init__(self, nombre_entidad: str, id_entidad: str | int):
        self.nombre_entidad = nombre_entidad
        self.id_entidad = id_entidad
        super().__init__(f"{nombre_entidad} con identificador '{id_entidad}' no fue encontrado.")

class EntidadYaExisteExcepcion(ExcepcionDominio):
    """Excepción cuando una entidad ya existe en la base de datos."""
    def __init__(self, nombre_entidad: str, campo: str, valor: str):
        self.nombre_entidad = nombre_entidad
        self.campo = campo
        self.valor = valor
        super().__init__(f"{nombre_entidad} con {campo} '{valor}' ya existe en el sistema.")

class ReglaNegocioExcepcion(ExcepcionDominio):
    """Excepción cuando se viola una regla de negocio del sistema académico."""
    pass
