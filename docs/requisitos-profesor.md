# Requisitos del portafolio — Diseño de Interfaces

Fuente: https://structure-portfolio.vercel.app/

## Stack obligatorio
- Next.js (App Router) + TypeScript
- Tailwind CSS
- GitHub (repo con commits) + Vercel (URL pública)

## Secciones (en este orden)
1. **Menú** — logo/nombre/iniciales, anclas a todas las secciones, sticky, hamburguesa en móvil, scroll suave.
2. **Hero + CV** — nombre grande, rol, foto/avatar, frase corta, **botón «Descargar CV» (obligatorio, `public/cv.pdf`)**, botón secundario (Ver proyectos / Contacto).
3. **Acerca de mí** — párrafo en 1ª persona (3–5 líneas), foto/ilustración, habilidades/tecnologías, datos rápidos (ubicación, semestre, intereses).
4. **Proyectos** — tarjeta por proyecto (imagen, título, descripción, tags), **link a GitHub y link a demo en Vercel (obligatorios)**, grid 1 col móvil / 2–3 escritorio, `target="_blank"`. Datos en `data/projects.ts`.
5. **Testimonios** — **mínimo 3**, con nombre, cargo/relación, foto/avatar, texto.
6. **Experiencia** — **académica y laboral (ambas obligatorias)**, fechas, institución/empresa + cargo, logros, de más reciente a más antigua.
7. **Contactos** — correo, LinkedIn, GitHub, (WhatsApp opcional), formulario nombre/correo/mensaje con validación y mensaje de confirmación (Formspree/EmailJS).
8. **Footer** — nombre + © año, íconos de redes, enlaces rápidos, botón «volver arriba», créditos «Hecho con Next.js + Tailwind».
9. **Sección adicional** (mínimo 1, antes del footer) — p. ej. Habilidades, Certificados, Idiomas, Modo oscuro, Logros, Servicios, Galería.

## Estructura de carpetas sugerida
```
app/ layout.tsx · page.tsx · globals.css
components/ Navbar · Hero · About · Projects · Testimonials · Experience · Contact · Skills · Footer
data/ projects.ts
public/ cv.pdf · images/
```

## Checklist final
- [x] Next.js + TS · [x] Tailwind · [x] 8 secciones + adicionales (Skills y Lab)
- [x] Responsive (probado en 375, 768, 1280 y 1920 px sin scroll horizontal)
- [x] Código en GitHub · [x] Publicado en Vercel

## Auditoría (Fase 6) — estado por sección

| Sección | Requisito | Estado |
|---|---|---|
| Menú | Logo/nombre, anclas, sticky, hamburguesa, scroll suave | ✅ |
| Hero | Nombre, rol, foto/avatar, frase, **Descargar CV**, botón secundario | ✅ (avatar con iniciales hasta tener foto; `cv.pdf` provisional) |
| Sobre mí | Párrafo, foto/ilustración, habilidades, datos rápidos | ✅ (texto provisional) |
| Proyectos | Tarjetas con imagen, título, descripción, tags, **GitHub + demo**, grid 1/2–3 col, `_blank` | ✅ (proyectos de ejemplo) |
| Testimonios | **≥ 3** con nombre, relación, avatar, texto | ✅ (de ejemplo) |
| Experiencia | **Académica + laboral**, fechas, lugar, logros, orden reciente→antiguo | ✅ (de ejemplo) |
| Contacto | Correo, LinkedIn, GitHub, formulario con validación y confirmación | ✅ (falta correo real y Formspree) |
| Footer | Nombre + © año, íconos de redes, enlaces, volver arriba, créditos | ✅ |
| Adicional | ≥ 1 sección extra antes del footer | ✅ Skills + Lab |

**Lo único que falta es contenido real** → ver [`contenido.md`](contenido.md).

### Lighthouse (producción local, 2026-11-16)
| | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Móvil | 52 | 100 | 100 | 100 |
| Escritorio | 63 | 100 | 100 | 100 |

El rendimiento lo baja el Total Blocking Time del 3D/animaciones en el Chrome sin GPU que usa Lighthouse con CPU limitada; en un navegador con GPU no aparecen tareas largas.
