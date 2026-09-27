import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
import os

def build_university_document():
    doc = docx.Document()

    # Normal Style Configuration (Calibri 12, Line Spacing 1.5)
    style_normal = doc.styles['Normal']
    font = style_normal.font
    font.name = 'Calibri'
    font.size = Pt(12)
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.space_after = Pt(6)

    # PORTADA
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("SISTEMA DE INFORMACIÓN ACADÉMICA UNIVERSITARIA\n\"ACADEMISYS\"\n")
    run_title.bold = True
    run_title.font.size = Pt(20)
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    p_subtitle = doc.add_paragraph()
    p_subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_subtitle.add_run("Documento Técnico de Respaldo - Proyecto Completo Fullstack\nArquitectura Limpia (Clean Architecture), FastAPI, PostgreSQL y React TSX\n")
    run_sub.font.size = Pt(14)
    run_sub.font.color.rgb = RGBColor(99, 102, 241)

    doc.add_paragraph("\n" * 4)

    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.add_run("Asignatura: Desarrollo de Sistemas de Información\n")
    p_meta.add_run("Tipo de Entregable: Proyecto Técnico Final (Backend, BD, Frontend y Docs)\n")
    p_meta.add_run("Tecnologías: Python 3.13, FastAPI, SQLAlchemy, PostgreSQL, React, TypeScript (TSX)\n")
    p_meta.add_run("Fecha de Entrega: 30 de septiembre\n")

    doc.add_page_break()

    # ÍNDICE DEL PROYECTO
    h_idx = doc.add_heading("ÍNDICE DEL PROYECTO", level=1)
    h_idx.style.font.name = 'Calibri'
    
    indices = [
        "1. Introducción",
        "2. Requisitos funcionales",
        "3. Requisitos no funcionales",
        "4. Metodología ambiental",
        "   4.1 Descripción contexto",
        "   4.2 Lista de eventos",
        "   4.3 Diagrama de contexto",
        "5. Metodología comportamiento",
        "   5.1 Nivel 1, 2, 3",
        "   5.2 Diagrama DER",
        "   5.3 Diccionario de Datos",
        "6. Arquitectura de la Solución",
        "   6.1 Descripción de la arquitectura limpia implementada",
        "   6.2 Diagrama de componentes",
        "7. Implementación del Backend",
        "   7.1 Estructura del proyecto",
        "   7.2 Endpoints/servicios implementados",
        "   7.3 Conexión a la base de datos",
        "8. Base de Datos",
        "   8.1 Modelo de datos implementado",
        "   8.2 Scripts/migraciones",
        "9. Implementación del Frontend (React TSX)",
        "   9.1 Estructura de componentes TSX",
        "   9.2 Consumo de la API del backend (cliente_api.ts)",
        "   9.3 Capturas de interfaz y descripción funcional",
        "10. Conclusiones",
        "11. Anexos",
        "   11.1 Enlace al repositorio de código"
    ]
    for item in indices:
        doc.add_paragraph(item)

    doc.add_page_break()

    # Read markdown content and fill document sections
    md_path = "c:\\Users\\jesus\\Downloads\\Proyecto\\docs\\Documento_Tecnico_Proyecto_Academico.md"
    if os.path.exists(md_path):
        with open(md_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for line in lines:
            line_str = line.strip()
            if line_str.startswith("# "):
                doc.add_heading(line_str.replace("# ", ""), level=1)
            elif line_str.startswith("## "):
                doc.add_heading(line_str.replace("## ", ""), level=2)
            elif line_str.startswith("### "):
                doc.add_heading(line_str.replace("### ", ""), level=3)
            elif line_str.startswith("* ") or line_str.startswith("- "):
                doc.add_paragraph(line_str[2:], style='List Bullet')
            elif line_str:
                doc.add_paragraph(line_str)

    output_path = "c:\\Users\\jesus\\Downloads\\Proyecto\\docs\\Documento_Tecnico_Proyecto_Academico.docx"
    doc.save(output_path)
    print(f"Documento Word guardado exitosamente en: {output_path}")

if __name__ == "__main__":
    build_university_document()
