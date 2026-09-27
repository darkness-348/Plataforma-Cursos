# DOCUMENTO TÉCNICO DE RESPALDO

## SISTEMA DE GESTIÓN ACADÉMICA UNIVERSITARIA ("ACADEMISYS")
**Implementación Fullstack Completa con Arquitectura Limpia, Autenticación JWT Bearer, Control de Acceso por Roles (RBAC), Python (FastAPI), PostgreSQL y React TSX**

---

### PORTADA
* **Asignatura:** Desarrollo de Sistemas de Información
* **Título de la Tarea:** Sistema de Información Académica con Arquitectura Limpia, Base de Datos, Autenticación JWT Bearer, Vistas por Rol y Frontend en React + TypeScript (TSX)
* **Estudiante:** [Nombre del Estudiante]
* **Tecnologías:** Python 3.13, FastAPI, PyJWT, Bcrypt, SQLAlchemy ORM, PostgreSQL / SQLite, React 18, Vite, TypeScript (TSX)
* **Fecha de Entrega:** 30 de septiembre

---

## ÍNDICE DEL PROYECTO

1. **Introducción**
2. **Requisitos Funcionales**
3. **Requisitos No Funcionales**
4. **Metodología Ambiental**
   * 4.1 Descripción del Contexto
   * 4.2 Lista de Eventos
   * 4.3 Diagrama de Contexto
5. **Metodología del Comportamiento**
   * 5.1 Niveles de Procesos (Nivel 1, 2, 3)
   * 5.2 Diagrama Entidad-Relación (DER)
   * 5.3 Diccionario de Datos
6. **Arquitectura de la Solución**
   * 6.1 Descripción de la Arquitectura Limpia Implementada
   * 6.2 Control de Acceso por Roles (RBAC) y Seguridad JWT
   * 6.3 Diagrama de Componentes
7. **Implementación del Backend**
   * 7.1 Estructura del Proyecto (Carpetas en Inglés, Archivos y Variables en Español)
   * 7.2 Endpoints de Autenticación y Servicios REST
   * 7.3 Conexión a la Base de Datos
8. **Base de Datos**
   * 8.1 Modelo de Datos Implementado (`carreras`, `estudiantes`, `docentes`, `asignaturas`, `matriculas`, `usuarios`)
   * 8.2 Scripts DDL y DML (`esquema.sql`, `datos_iniciales.sql` y `sembrar.py`)
9. **Implementación del Frontend (React + TypeScript TSX)**
   * 9.1 Contexto de Autenticación (`ContextoAutenticacion.tsx`)
   * 9.2 Vistas de Registro e Inicio de Sesión (`AutenticacionPage.tsx`)
   * 9.3 Vistas Protegidas por Rol (`PanelPrincipalPage.tsx`, `CarrerasPage.tsx`, `EstudiantesPage.tsx`, `DocentesPage.tsx`, `AsignaturasPage.tsx`, `MatriculasPage.tsx`)
10. **Conclusiones**
11. **Anexos**
   * 11.1 Enlace al Repositorio de Código

---

## 1. INTRODUCCIÓN

En el ámbito de la educación superior, la seguridad en la gestión de datos académicos representa un requerimiento de primer orden. La solución **AcademiSys** ha sido ampliada para incorporar un subsistema completo de **Autenticación con Tokens JWT (JSON Web Tokens) Bearer** y **Control de Acceso Basado en Roles (RBAC)**.

El sistema permite el registro de usuarios, el inicio de sesión seguro mediante hashing con la librería `bcrypt`, la emisión de tokens JWT firmados y la renderización condicional de la interfaz gráfica en React TSX según los permisos asignados a cada rol (**Administrador**, **Docente** o **Estudiante**).

---

## 2. REQUISITOS FUNCIONALES

| Código | Nombre del Requisito | Descripción |
| :--- | :--- | :--- |
| **RF-01** | Registro de Usuarios | Permitir la creación de cuentas de usuario asignando nombre, correo, clave y rol institicional. |
| **RF-02** | Autenticación JWT Bearer | Validar credenciales de acceso y emitir un token firmado JWT Bearer con tiempo de expiración (24h). |
| **RF-03** | Control de Acceso por Roles (RBAC) | Restringir operaciones sensibles según el rol del usuario autenticado (Administrador, Docente, Estudiante). |
| **RF-04** | Vinculación Automática de Expediente | Asociar automáticamente la cuenta de usuario con el expediente existente de Estudiante o Docente mediante Cédula/DNI. |
| **RF-05** | Gestión de Carreras | Registrar, consultar, actualizar y eliminar programas académicos (Exclusivo Administrador). |
| **RF-06** | Gestión de Estudiantes | Administrar expedientes de alumnos (Acceso Administrador y Docente). |
| **RF-07** | Gestión de Docentes Académicos | Administrar la nómina de profesores (Exclusivo Administrador). |
| **RF-08** | Gestión de Asignaturas y Aulas | Crear y consultar materias (Administrador, Docente y Estudiante). |
| **RF-09** | Matrícula y Evaluación | Registrar inscripciones y computar calificaciones parciales/finales (Administrador, Docente y Estudiante). |
| **RF-10** | Cierre de Sesión Seguro | Invalidar la sesión en el cliente limpiando los encabezados Authorization y `localStorage`. |

---

## 3. REQUISITOS NO FUNCIONALES

| Código | Requisito No Funcional | Criterio de Aceptación |
| :--- | :--- | :--- |
| **RNF-01** | Hashing Seguro de Contraseñas | Uso de algoritmo `bcrypt` con sal sintética para proteger claves almacenadas en la base de datos. |
| **RNF-02** | Firmado Criptográfico JWT | Tokens generados con algoritmo `HS256` y clave secreta del sistema. |
| **RNF-03** | Encabezado Estándar HTTP Bearer | Todas las peticiones del cliente API incluyen el encabezado `Authorization: Bearer <token>`. |
| **RNF-04** | Renderizado Dinámico por Permisos | Ocultación automática de elementos del menú lateral y páginas no permitidas en React TSX. |

---

## 4. MATRIZ DE PERMISOS POR ROL (RBAC)

| Módulo / Vista | Administrador | Docente | Estudiante |
| :--- | :---: | :---: | :---: |
| **Inicio de Sesión / Registro** | ✅ | ✅ | ✅ |
| **Panel Principal (Dashboard)** | ✅ | ✅ | ✅ |
| **Gestión de Carreras** | ✅ | ❌ | ❌ |
| **Gestión de Estudiantes** | ✅ | ✅ (Lectura) | ❌ |
| **Gestión de Docentes** | ✅ | ❌ | ❌ |
| **Asignaturas y Aulas** | ✅ | ✅ (Sus Cursos) | ✅ (Ver Oferta) |
| **Matrículas & Calificaciones** | ✅ | ✅ (Ingresar Notas) | ✅ (Ver Sus Notas) |

---

## 5. BASE DE DATOS

### Tabla: `usuarios`
| Campo | Tipo de Dato | Clave | Nulo | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | SERIAL / INT | PK | No | Identificador único del usuario. |
| `nombre_completo` | VARCHAR(150) | - | No | Nombre del titular de la cuenta. |
| `correo` | VARCHAR(150) | UNIQUE | No | Correo electrónico de acceso. |
| `clave_hash` | VARCHAR(255) | - | No | Contraseña encriptada con Bcrypt. |
| `rol` | VARCHAR(50) | - | No | Rol asignado (`Administrador`, `Docente`, `Estudiante`). |
| `estudiante_id` | INT | FK | Sí | Referencia a `estudiantes.id`. |
| `docente_id` | INT | FK | Sí | Referencia a `docentes.id`. |
| `estado` | VARCHAR(20) | - | No | Estado (`Activo`, `Inactivo`). |

---

## 6. CONCLUSIONES

1. **Autenticación Estándar de la Industria:** Se implementó una solución robusta utilizando JWT Bearer tokens y encriptado Bcrypt.
2. **Control de Acceso Dinámico:** El frontend en React TSX ajusta dinámicamente sus vistas y permisos respetando la matriz RBAC.
3. **Cuentas de Prueba listas para evaluación:**
   * 🔴 **Administrador:** `admin@universidad.edu` / `admin123`
   * 🟢 **Docente:** `carlos.mendoza@universidad.edu` / `docente123`
   * 🔵 **Estudiante:** `juan.rodriguez@estudiantes.edu` / `estudiante123`
