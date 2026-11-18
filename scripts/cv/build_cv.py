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
        "sections": {"edu": "Education", "projects": "Projects", "exp": "Experience", "skills": "Skills & Interests"},
        "portfolio": "Portfolio: ",
        "education": [
            {
                "org": "Universidad Cooperativa de Colombia", "place": "Pasto, Colombia",
                "title": "B.S. in Software Engineering (5th semester)", "date": "Aug 2024 – May 2028 (expected)",
                "note": "Relevant Coursework: Data Structures, Interface Design.",
            },
            {
                "org": "Bayswater College", "place": "Calgary, Canada",
                "title": "General English Standard Course (C1)", "date": "",
            },
            {
                "org": "Colegio Filipense “Nuestra Señora de la Esperanza”", "place": "Pasto, Colombia",
                "title": "High School Diploma (Bachiller Académico)", "date": "Dec 2022",
            },
        ],
        "projects": [
            {
                "org": "Ancla Calma", "place": "React, Vite, Tailwind, Supabase",
                "title": "Developer, with UPB design students", "date": "2026",
                "bullets": [
                    "Turned a UPB design team’s concept into a working emotional-support web app for university students.",
                    "Built guided breathing, grounding and sensory exercises, crisis help lines and a guide for supporting a peer.",
                    "Added Supabase accounts with a private journal, voice notes and trusted contacts.",
                ],
            },
            {
                "org": "FinanzIA", "place": "Next.js, Java, LangGraph",
                "title": "Team member", "date": "2026",
                "bullets": [
                    "Co-built a conversational personal-finance assistant: a Next.js chat with a secure backend-for-frontend, a Java backend and a LangGraph AI agent that records expenses, income, budgets and savings goals.",
                ],
            },
            {
                "org": "Chef Digital", "place": "Electron, Svelte, TypeScript, Supabase",
                "title": "Developer", "date": "2026",
                "bullets": [
                    "Built a desktop cooking assistant for Windows, macOS and Linux that suggests recipes from the user’s pantry and guides each step with timers, voice narration and hands-free voice commands (Gemini, Vosk).",
                    "Added Supabase accounts with cloud-synced chats and recipes and a backend on Supabase Edge Functions, covered by 550+ automated tests (Vitest).",
                ],
            },
            {
                "org": "TickGo · Vinyl Player · Ecos de la Tierra", "place": "Kotlin, JavaScript, Godot",
                "title": "Developer", "date": "2026",
                "bullets": [
                    "TickGo: Wear OS app that plans preparation backwards from an event and learns how long the user really takes.",
                    "Vinyl Player: music player whose playlist is a doubly linked list, with an LRU cache and a Web Audio visualizer.",
                    "Ecos de la Tierra (team): 2D pixel-art RPG with action and turn-based combat built in Godot.",
                ],
            },
        ],
        "experience": [
            {
                "org": "Coldulces La 21", "place": "Pasto, Colombia",
                "title": "Customer Service Representative", "date": "Mar 2023 – May 2026",
                "bullets": [
                    "Advised in-person and remote customers on products, promotions and services.",
                    "Managed billing, cash handling (cash and electronic payments) and inventory control.",
                    "Supported logistics and order distribution, coordinating deliveries to shorten delivery times.",
                ],
            },
        ],
        "skills": [
            ("Programming: ", "Java, Python, JavaScript, TypeScript, SQL, Kotlin, HTML/CSS."),
            ("Frameworks & tools: ", "React, Next.js, Svelte, Tailwind, Django, Flutter, Electron, Node.js, REST APIs; PostgreSQL, MongoDB, Supabase; AWS (Lambda), Git, GitHub."),
            ("Engineering: ", "Object-oriented programming, data structures, design patterns, software architecture, database design, debugging; AI agents (LangGraph, Gemini API)."),
            ("Language: ", "Spanish (native), English (C1, full professional proficiency)."),
            ("Interests: ", "Web development, UI/UX, motion design, video games."),
        ],
    },
    "es": {
        "sections": {"edu": "Educación", "projects": "Proyectos", "exp": "Experiencia", "skills": "Habilidades e intereses"},
        "portfolio": "Portafolio: ",
        "education": [
            {
                "org": "Universidad Cooperativa de Colombia", "place": "Pasto, Colombia",
                "title": "Ingeniería de Software (5.º semestre)", "date": "Ago 2024 – May 2028 (esperado)",
                "note": "Cursos relevantes: Estructuras de Datos, Diseño de Interfaces.",
            },
            {
                "org": "Bayswater College", "place": "Calgary, Canadá",
                "title": "General English Standard Course (C1)", "date": "",
            },
            {
                "org": "Colegio Filipense “Nuestra Señora de la Esperanza”", "place": "Pasto, Colombia",
                "title": "Bachiller Académico", "date": "Dic 2022",
            },
        ],
        "projects": [
            {
                "org": "Ancla Calma", "place": "React, Vite, Tailwind, Supabase",
                "title": "Desarrollador, con estudiantes de diseño de la UPB", "date": "2026",
                "bullets": [
                    "Convertí el concepto de un equipo de diseño de la UPB en una app web de apoyo emocional.",
                    "Desarrollé ejercicios guiados de calma, líneas de ayuda en crisis y una guía para acompañar a otros.",
                    "Agregué cuentas con Supabase, bitácora privada, notas de voz y contactos de confianza.",
                ],
            },
            {
                "org": "FinanzIA", "place": "Next.js, Java, LangGraph",
                "title": "Integrante del equipo", "date": "2026",
                "bullets": [
                    "Co-desarrollé un asistente conversacional de finanzas personales: chat en Next.js con backend-for-frontend seguro, backend en Java y un agente de IA con LangGraph que registra gastos, ingresos, presupuestos y metas de ahorro.",
                ],
            },
            {
                "org": "Chef Digital", "place": "Electron, Svelte, TypeScript, Supabase",
                "title": "Desarrollador", "date": "2026",
                "bullets": [
                    "Desarrollé un asistente de cocina de escritorio (Windows, macOS, Linux) que sugiere recetas según la despensa y guía cada paso con temporizadores, narración y comandos de voz (Gemini, Vosk).",
                    "Agregué cuentas y nube con Supabase (Edge Functions), cubierto por más de 550 pruebas en Vitest.",
                ],
            },
            {
                "org": "TickGo · Vinyl Player · Ecos de la Tierra", "place": "Kotlin, JavaScript, Godot",
                "title": "Desarrollador", "date": "2026",
                "bullets": [
                    "TickGo: app Wear OS que planea la preparación desde la hora del evento y aprende tus tiempos reales.",
                    "Vinyl Player: reproductor con lista doblemente enlazada, caché LRU y visualizador Web Audio.",
                    "Ecos de la Tierra (en equipo): RPG 2D en pixel art con combate de acción y por turnos, hecho en Godot.",
                ],
            },
        ],
        "experience": [
            {
                "org": "Coldulces La 21", "place": "Pasto, Colombia",
                "title": "Representante de Atención al Cliente", "date": "Mar 2023 – May 2026",
                "bullets": [
                    "Asesoré a clientes presenciales y remotos sobre productos, promociones y servicios.",
                    "Gestioné facturación, manejo de caja (efectivo y medios electrónicos) y control de inventario.",
                    "Apoyé la logística y distribución de pedidos, coordinando entregas para reducir los tiempos.",
                ],
            },
        ],
        "skills": [
            ("Programación: ", "Java, Python, JavaScript, TypeScript, SQL, Kotlin, HTML/CSS."),
            ("Frameworks y herramientas: ", "React, Next.js, Svelte, Tailwind, Django, Flutter, Electron, Node.js, APIs REST; PostgreSQL, MongoDB, Supabase; AWS (Lambda), Git, GitHub."),
            ("Ingeniería: ", "POO, estructuras de datos, patrones de diseño, arquitectura de software, diseño de bases de datos, depuración; agentes de IA (LangGraph, Gemini)."),
            ("Idiomas: ", "Español (nativo), inglés (C1)."),
            ("Intereses: ", "Desarrollo web, UI/UX, animación, videojuegos."),
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
    out = [para([run(NAME, bold=True, size=32)], '<w:spacing w:before="0" w:after="40"/><w:jc w:val="center"/>')]

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
    out.append(heading(s["projects"]))
    entries(c["projects"])
    out.append(heading(s["exp"]))
    entries(c["experience"])
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
