"""Builds Juan's CV in Harvard's 2025 bullet template, in English and Spanish.

Keeps the template's styles, margins, fonts and bullet numbering; only the body is replaced.
Run from the repo root:  python scripts/cv/build_cv.py
Outputs docs/cv/CV-Juan-Rueda-{en,es}.docx (editable) and public/cv.pdf / public/cv-es.pdf
(converted by Microsoft Word through PowerShell COM). Edit the CONTENT below, not the files.
"""

import re
import subprocess
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = Path(__file__).with_name("harvard-template.docx")

NAME = "Juan José Rueda Viveros"
CONTACT = [
    ("Pasto, Nariño, Colombia", None),
    ("juanjoruedav@gmail.com", "mailto:juanjoruedav@gmail.com"),
    ("linkedin.com/in/juan-josé-rueda-viveros-75b8972a6", "https://www.linkedin.com/in/juan-jos%C3%A9-rueda-viveros-75b8972a6"),
    ("github.com/JuanRueda08-ucc", "https://github.com/JuanRueda08-ucc"),
]
PORTFOLIO = ("portfolio-five-pi-tko6sn9i9q.vercel.app", "https://portfolio-five-pi-tko6sn9i9q.vercel.app")

CONTENT = {
    "en": {
        "headline": "Software Engineer & AI Engineer",
        "sections": {"edu": "Education", "exp": "Experience", "projects": "Projects", "skills": "Skills"},
        "portfolio": "Portfolio: ",
        "education": [
            {
                "org": "Universidad Cooperativa de Colombia", "place": "Pasto, Colombia",
                "title": "B.S. in Software Engineering (5th semester)", "date": "Aug 2024 – May 2028 (expected)",
                "note": "Relevant Coursework: Data Structures, Interface Design.",
            },
            {
                "org": "Colegio Filipense “Nuestra Señora de la Esperanza”", "place": "Pasto, Colombia",
                "title": "High School Diploma (Bachiller Académico)", "date": "Dec 2022",
            },
        ],
        "experience": [
            {
                "org": "Ancla Calma · Universidad Pontificia Bolivariana (UPB) project", "place": "Remote",
                "title": "Software Developer (React, Vite, Tailwind, Supabase)", "date": "2026",
                "bullets": [
                    "Turned a UPB design team’s concept into a working emotional-support web app for university students.",
                    "Built it end to end with their feedback, from the interface to Supabase accounts, and deployed it on Vercel.",
                ],
            },
            {
                "org": "Coldulces La 21", "place": "Pasto, Colombia",
                "title": "Customer Service Representative", "date": "Mar 2023 – May 2026",
                "bullets": [
                    "Advised in-person and remote customers; managed billing, cash handling and inventory control.",
                    "Supported logistics and order distribution, coordinating deliveries to shorten delivery times.",
                ],
            },
        ],
        "projects": [
            {
                "org": "Vigía", "place": "Flutter, Kotlin, MediaPipe, Firebase",
                "title": "Developer · Android drowsiness monitor", "date": "2026",
                "bullets": [
                    "Built an Android app that detects sustained eye closure with MediaPipe Face Landmarker running on the device (CameraX, native Kotlin engine), with per-driver calibration and voice guidance.",
                    "Added alerts with sound and vibration patterns, a local session history and Firebase accounts.",
                ],
            },
            {
                "org": "Ancla Calma", "place": "React, Vite, Tailwind, Supabase",
                "title": "Developer · Emotional-support web app (ancla-calma.vercel.app)", "date": "2026",
                "bullets": [
                    "Guided breathing, grounding and sensory exercises, crisis help lines, a private journal with voice notes and trusted contacts.",
                ],
            },
            {
                "org": "FinanzIA", "place": "Next.js, Java, LangGraph",
                "title": "Team member · AI finance assistant", "date": "2026",
                "bullets": [
                    "Co-built a conversational personal-finance assistant: a Next.js chat with a secure backend-for-frontend, a Java backend and a LangGraph AI agent that records expenses, income, budgets and savings goals.",
                ],
            },
            {
                "org": "Chef Digital", "place": "Electron, Svelte, TypeScript, Supabase",
                "title": "Developer · Desktop cooking assistant", "date": "2026",
                "bullets": [
                    "Built a desktop assistant for Windows, macOS and Linux that suggests recipes from the user’s pantry and guides each step with timers, voice narration and hands-free voice commands (Gemini, Vosk).",
                    "Added Supabase accounts and a backend on Edge Functions, covered by 550+ automated tests (Vitest).",
                ],
            },
            {
                "org": "Ecos de la Tierra · Vinyl Player · TickGo", "place": "Godot, JavaScript, Kotlin",
                "title": "Developer", "date": "2026",
                "bullets": [
                    "Ecos de la Tierra (team): 2D pixel-art RPG with action and turn-based combat built in Godot.",
                    "Vinyl Player: music player whose playlist is a doubly linked list, with an LRU cache and a Web Audio visualizer.",
                    "TickGo: Wear OS app that plans preparation backwards from an event and learns how long the user really takes.",
                ],
            },
        ],
        "skills": [
            ("AI: ", "LLM agents (LangGraph), Gemini API, on-device computer vision (MediaPipe), speech recognition (Vosk)."),
            ("Programming: ", "Java, Python, JavaScript, TypeScript, Dart, Kotlin, SQL, HTML/CSS."),
            ("Frameworks & tools: ", "React, Next.js, Svelte, Tailwind, Flutter, Electron, Django, Node.js, REST APIs; PostgreSQL, MongoDB, Supabase, Firebase; AWS (Lambda), Git, GitHub."),
            ("Engineering: ", "OOP, data structures, design patterns, software architecture, database design, debugging."),
            ("Language: ", "Spanish (native), English (C1; General English course, Bayswater College, Calgary, Canada)."),
        ],
    },
    "es": {
        "headline": "Ingeniero de Software e Ingeniero de IA",
        "sections": {"edu": "Educación", "exp": "Experiencia", "projects": "Proyectos", "skills": "Habilidades"},
        "portfolio": "Portafolio: ",
        "education": [
            {
                "org": "Universidad Cooperativa de Colombia", "place": "Pasto, Colombia",
                "title": "Ingeniería de Software (5.º semestre)", "date": "Ago 2024 – May 2028 (esperado)",
                "note": "Cursos relevantes: Estructuras de Datos, Diseño de Interfaces.",
            },
            {
                "org": "Colegio Filipense “Nuestra Señora de la Esperanza”", "place": "Pasto, Colombia",
                "title": "Bachiller Académico", "date": "Dic 2022",
            },
        ],
        "experience": [
            {
                "org": "Ancla Calma · Proyecto de la Universidad Pontificia Bolivariana (UPB)", "place": "Remoto",
                "title": "Desarrollador de software (React, Vite, Tailwind, Supabase)", "date": "2026",
                "bullets": [
                    "Convertí el concepto de un equipo de diseño de la UPB en una app web de apoyo emocional.",
                    "La construí de punta a punta con sus comentarios, de la interfaz a las cuentas en Supabase, y la publiqué en Vercel.",
                ],
            },
            {
                "org": "Coldulces La 21", "place": "Pasto, Colombia",
                "title": "Representante de Atención al Cliente", "date": "Mar 2023 – May 2026",
                "bullets": [
                    "Asesoré a clientes presenciales y remotos; gestioné facturación, caja e inventario.",
                    "Apoyé la logística y distribución de pedidos, coordinando entregas para reducir los tiempos.",
                ],
            },
        ],
        "projects": [
            {
                "org": "Vigía", "place": "Flutter, Kotlin, MediaPipe, Firebase",
                "title": "Desarrollador · Monitor de somnolencia para Android", "date": "2026",
                "bullets": [
                    "App Android que detecta el cierre ocular sostenido con MediaPipe Face Landmarker en el dispositivo (CameraX, motor nativo en Kotlin), con calibración y guía por voz.",
                    "Alertas con sonido y patrones de vibración, historial local de sesiones y cuentas con Firebase.",
                ],
            },
            {
                "org": "Ancla Calma", "place": "React, Vite, Tailwind, Supabase",
                "title": "Desarrollador · App web de apoyo emocional (ancla-calma.vercel.app)", "date": "2026",
                "bullets": [
                    "Ejercicios guiados de respiración y grounding, líneas de ayuda en crisis, bitácora con notas de voz y contactos de confianza.",
                ],
            },
            {
                "org": "FinanzIA", "place": "Next.js, Java, LangGraph",
                "title": "Integrante del equipo · Asistente financiero con IA", "date": "2026",
                "bullets": [
                    "Co-desarrollé un asistente de finanzas: chat en Next.js, backend en Java y un agente de IA con LangGraph que registra gastos, ingresos, presupuestos y metas.",
                ],
            },
            {
                "org": "Chef Digital", "place": "Electron, Svelte, TypeScript, Supabase",
                "title": "Desarrollador · Asistente de cocina de escritorio", "date": "2026",
                "bullets": [
                    "Asistente para Windows, macOS y Linux que sugiere recetas según la despensa y guía cada paso con temporizadores, narración y comandos de voz (Gemini, Vosk).",
                    "Cuentas con Supabase y backend en Edge Functions, cubierto por más de 550 pruebas en Vitest.",
                ],
            },
            {
                "org": "Ecos de la Tierra · Vinyl Player · TickGo", "place": "Godot, JavaScript, Kotlin",
                "title": "Desarrollador", "date": "2026",
                "bullets": [
                    "Ecos de la Tierra (en equipo): RPG 2D en pixel art con combate de acción y por turnos, hecho en Godot.",
                    "Vinyl Player: reproductor con lista doblemente enlazada, caché LRU y visualizador Web Audio.",
                    "TickGo: app Wear OS que planea la preparación desde la hora del evento y aprende tus tiempos reales.",
                ],
            },
        ],
        "skills": [
            ("IA: ", "agentes con LLM (LangGraph), API de Gemini, visión por computadora (MediaPipe), voz (Vosk)."),
            ("Programación: ", "Java, Python, JavaScript, TypeScript, Dart, Kotlin, SQL, HTML/CSS."),
            ("Herramientas: ", "React, Next.js, Svelte, Tailwind, Flutter, Electron, Django, Node.js, APIs REST; PostgreSQL, MongoDB, Supabase, Firebase; AWS (Lambda), Git, GitHub."),
            ("Ingeniería: ", "POO, estructuras de datos, patrones de diseño, arquitectura de software, bases de datos, depuración."),
            ("Idiomas: ", "Español (nativo), inglés (C1; curso de inglés general en Bayswater College, Calgary, Canadá)."),
        ],
    },
}

# ---- XML pieces in the template's own formatting (Calibri 11, centered bold headings, numId 1 bullets)
FONT = '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>'
RIGHT_TAB = '<w:tabs><w:tab w:val="right" w:pos="10900"/></w:tabs>'


def run(text, bold=False, italic=False, size=None):
    props = FONT + ("<w:b/>" if bold else "") + ("<w:i/>" if italic else "") + (f'<w:sz w:val="{size}"/>' if size else "")
    return f'<w:r><w:rPr>{props}</w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r>'


def tab(bold=False):
    return f'<w:r><w:rPr>{FONT}{"<w:b/>" if bold else ""}</w:rPr><w:tab/></w:r>'


def para(runs, ppr=""):
    return f"<w:p><w:pPr>{ppr}<w:rPr>{FONT}</w:rPr></w:pPr>{''.join(runs)}</w:p>"


def spacer(after=0):
    return para([], f'<w:pStyle w:val="BodyText"/><w:spacing w:before="0" w:after="{after}"/><w:rPr>{FONT}<w:sz w:val="12"/></w:rPr>').replace(
        f"<w:rPr>{FONT}</w:rPr></w:pPr>", "</w:pPr>"
    )


def heading(text):
    border = '<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="000000"/></w:pBdr>'
    return para([run(text, bold=True)], f'<w:pStyle w:val="Heading1"/><w:keepNext/>{border}<w:spacing w:before="120" w:after="60"/><w:jc w:val="center"/>')


def line(left, right, bold_left=True, bold_right=False, italic_left=False):
    runs = [run(left, bold=bold_left, italic=italic_left)]
    if right:
        runs += [tab(), run(right, bold=bold_right)]
    return para(runs, f"<w:keepNext/>{RIGHT_TAB}<w:spacing w:before=\"0\" w:after=\"0\"/><w:ind w:left=\"119\"/>")


def body(runs):
    return para(runs, '<w:pStyle w:val="BodyText"/><w:spacing w:before="0" w:after="0"/><w:ind w:left="119"/>')


def bullet(text):
    return para(
        [run(text)],
        '<w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
        '<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:ind w:left="600" w:right="120" w:hanging="240"/>',
    )


def link(text, url, rid):
    return f'<w:hyperlink r:id="{rid}"><w:r><w:rPr>{FONT}<w:color w:val="1F3A93"/></w:rPr><w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:hyperlink>'


def build_body(lang, rels):
    c = CONTENT[lang]
    out = [para([run(NAME, bold=True, size=32)], '<w:spacing w:before="0" w:after="0"/><w:jc w:val="center"/>')]
    out.append(para([run(c["headline"], italic=True)], '<w:spacing w:before="0" w:after="30"/><w:jc w:val="center"/>'))

    contact = []
    for i, (text, url) in enumerate(CONTACT + [(c["portfolio"] + PORTFOLIO[0], PORTFOLIO[1])]):
        if i:
            contact.append(run("  •  "))
        contact.append(link(text, url, rels(url)) if url else run(text))
    out.append(para(contact, '<w:pStyle w:val="BodyText"/><w:spacing w:before="0" w:after="60"/><w:jc w:val="center"/>'))

    def entries(items):
        for j, e in enumerate(items):
            if j:
                out.append(spacer())
            out.append(line(e["org"], e["place"]))
            out.append(line(e["title"], e["date"], bold_left=False, italic_left=True))
            if e.get("note"):
                out.append(body([run(e["note"])]))
            for b in e.get("bullets", []):
                out.append(bullet(b))

    s = c["sections"]
    out.append(heading(s["edu"]))
    entries(c["education"])
    out.append(heading(s["exp"]))
    entries(c["experience"])
    out.append(heading(s["projects"]))
    # Projects: one header line (name · stack, year); the bullets say what each one is.
    for j, e in enumerate(c["projects"]):
        if j:
            out.append(spacer())
        out.append(para([run(e["org"], bold=True), run("  ·  " + e["place"], italic=True), tab(), run(e["date"])],
                        f"<w:keepNext/>{RIGHT_TAB}<w:spacing w:before=\"0\" w:after=\"0\"/><w:ind w:left=\"119\"/>"))
        for b in e.get("bullets", []):
            out.append(bullet(b))
    out.append(heading(s["skills"]))
    for label, text in c["skills"]:
        out.append(body([run(label, bold=True), run(text)]))
    return "".join(out)


def build(lang):
    src = zipfile.ZipFile(TEMPLATE)
    doc = src.read("word/document.xml").decode("utf8")
    rels = src.read("word/_rels/document.xml.rels").decode("utf8")

    ids = {}

    def rel(url):
        if url not in ids:
            rid = f"rIdCv{len(ids) + 1}"
            ids[url] = rid
        return ids[url]

    new_body = build_body(lang, rel)
    sect = re.search(r"<w:sectPr.*?</w:sectPr>", doc, re.S).group(0)
    # Tighter page: 0.5" margins all round (template bottom is 0.19").
    sect = re.sub(r'<w:pgMar [^>]*/>', '<w:pgMar w:top="648" w:right="605" w:bottom="576" w:left="605" w:header="720" w:footer="720" w:gutter="0"/>', sect)
    doc = re.sub(r"<w:body>.*</w:body>", f"<w:body>{new_body}{sect}</w:body>", doc, flags=re.S)
    extra = "".join(
        f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="{escape(url)}" TargetMode="External"/>'
        for url, rid in ids.items()
    )
    rels = rels.replace("</Relationships>", extra + "</Relationships>")

    out = ROOT / "docs" / "cv" / f"CV-Juan-Rueda-{lang}.docx"
    out.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for item in src.infolist():
            if item.filename.endswith("/"):
                continue
            data = {"word/document.xml": doc, "word/_rels/document.xml.rels": rels}.get(item.filename)
            z.writestr(item.filename, data.encode("utf8") if data is not None else src.read(item.filename))
    return out


def to_pdf(docx, pdf):
    ps = (
        "$w = New-Object -ComObject Word.Application; $w.Visible = $false; "
        f"$d = $w.Documents.Open('{docx}', $false, $true); "
        f"$d.SaveAs([ref]'{pdf}', [ref]17); $d.Close([ref]0); $w.Quit()"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", ps], check=True)


if __name__ == "__main__":
    for lang in sys.argv[1:] or ["en", "es"]:
        docx = build(lang)
        pdf = ROOT / "public" / ("cv.pdf" if lang == "en" else "cv-es.pdf")
        to_pdf(docx, pdf)
        print(lang, docx.relative_to(ROOT), "->", pdf.relative_to(ROOT))
