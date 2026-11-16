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
- [ ] Next.js + TS · [ ] Tailwind · [ ] 8 secciones + 1 adicional
- [ ] Responsive (celular, tablet, escritorio)
- [ ] Código en GitHub · [ ] Publicado en Vercel
