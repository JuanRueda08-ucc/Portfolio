# Plan del portafolio — Juano Rueda

Ingeniería de Software · 5.º semestre · San Juan de Pasto
Requisitos del profesor: ver [requisitos-profesor.md](requisitos-profesor.md)

---

## 1. Qué tomamos de cada referencia (y cómo está hecho)

| Referencia | Detalle que nos gusta | Cómo está hecho (analizado) | Cómo lo hacemos nosotros |
|---|---|---|---|
| **elicubillos.com** (principal) | Loader donde la "O" de LOADING se estira como barra de progreso | Next.js + GSAP | Loader propio: la "O" se estira con el % real de carga (GSAP) |
| | "hello" 3D de vidrio que refracta el fondo | Three.js r186 (WebGL), material de transmisión/vidrio | React Three Fiber + drei `MeshTransmissionMaterial`. Palabra propia: **"hola"** (o "Juano") |
| | Fondo de cuadrícula que se ilumina donde pasa el cursor | Canvas "micro-slats" + shader | Shader GLSL propio (cuadrícula morada reactiva al mouse) |
| | Todo el texto se mueve con el cursor (parallax) | GSAP + posición del mouse | Hook `useParallax` con GSAP `quickTo` |
| | Scroll suave, secciones fijas (pinned) | Lenis + GSAP ScrollTrigger | Lo mismo: Lenis + ScrollTrigger |
| | "Featured Work": TV retro en el centro, anillo de puntos, lista de nombres que se resalta | Sección sticky + ScrollTrigger | Igual idea, pero con un **monitor/ventana propio** que reproduce el **video** de cada proyecto |
| | "Work": carrusel en arco | ScrollTrigger + transforms 3D CSS | Carrusel en arco con nuestras tarjetas |
| | Tarjetas de skills moradas escalonadas | GSAP stagger | Sección "Skills" (sección adicional) |
| | Footer con reloj en vivo y fondo de píxeles "faulty terminal" | Componente WebGL *Faulty Terminal* (React Bits) | Footer con reloj de Pasto + fondo de píxeles WebGL |
| **kiira.in** | Cursor = circulito que se convierte en etiqueta ("View project", "Hi") | Framer + Framer Motion + Lenis | Componente `<Cursor/>` con Motion; cualquier elemento con `data-cursor="Ver proyecto"` cambia el cursor |
| | Objetos que se pueden arrastrar (nenúfares) | Framer Motion `drag` | Stickers/objetos arrastrables en el hero y "Sobre mí" (Motion `drag`) |
| | Proyectos en video | `<video>` autoplay muted loop | Videos de tus proyectos (MP4/WebM comprimidos) |
| **evebouffard.com** | Sidebar con "Explorations": Microsoft Paint, Paper Effects, Paper Filters, WebGL Fuji (mini-apps reales) | Next/React, mini-apps en rutas propias | **Laboratorio `/lab`**: mini-herramientas propias (ver §4) |
| **andreas.vision** | Transición al cambiar de página: la página se encoge como tarjeta, se ve el cielo de píxeles detrás y entra la nueva | View Transitions API + Motion + Lenis | View Transitions de Next.js + fondo de píxeles detrás |
| | "Play": lienzo infinito que se arrastra en cualquier dirección, lleno de experimentos | Canvas/grid infinito arrastrable | La portada de `/lab` será un lienzo infinito arrastrable |
| | Barra de menú tipo "píldora" flotante | CSS | Nuestro menú (ver §3) |
| **elissamartial.com** | Frase con palabras dispersas por la pantalla ("Why not aspire to make the world just a little magical?") cuyas letras cambian al azar | Vite + React. Cada letra es un `<span>`; cada cierto tiempo una letra se reemplaza por otra aleatoria con otro color y vuelve | Componente `<ScrambleText/>` (GSAP ScrambleText o hook propio) con letras en morado |
| | Imagen dibujada con trazos finos que aparece alrededor del cursor y se va acumulando | Canvas 2D: la imagen se convierte en líneas/partículas que solo se pintan cerca del puntero | Canvas propio: **tu foto dibujada con líneas moradas** que se revela con el cursor |

---

## 2. Stack técnico

**Obligatorio (profesor):** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · GitHub · Vercel

**Añadidos:**
| Librería | Para qué |
|---|---|
| `gsap` (+ ScrollTrigger, SplitText, ScrambleText; todos gratis) | Animaciones de scroll, loader, parallax, letras que cambian |
| `lenis` | Scroll suave |
| `three` + `@react-three/fiber` + `@react-three/drei` | "hola" 3D de vidrio |
| GLSL (shaders propios) | Fondo de cuadrícula reactiva y fondo de píxeles del footer |
| `motion` (Framer Motion) | Cursor personalizado, objetos arrastrables, microinteracciones |
| View Transitions (Next.js) | Transiciones entre páginas estilo Andreas |
| Formspree | Formulario de contacto sin backend |

**Rendimiento y accesibilidad:** el 3D y los shaders se cargan en diferido (`dynamic import`). Con `prefers-reduced-motion` se usa una versión estática. En celular el cursor custom se desactiva y el 3D se simplifica.

---

## 3. Mapa del sitio

### `/` — Página principal (cumple las 8 secciones del profe en orden)
0. **Loader** — "CARGANDO" con la "O" estirándose.
1. **Menú (Navbar)** — barra flotante con forma de cápsula, centrada arriba, con fondo translúcido (blur): logo "Juano" · Inicio · Sobre mí · Proyectos · Experiencia · Contacto · botón **CV ↓**. Se queda fija al hacer scroll. En celular se ve solo el logo y un botón ☰; al tocarlo se abre el menú a pantalla completa.
2. **Hero + CV** — "hola" 3D de vidrio sobre la cuadrícula morada reactiva. "Hola, soy Juano Rueda · Ingeniero de Software en formación". Titular gigante abajo (ej. "CONSTRUYO SOFTWARE CON ALMA DE DISEÑO"). Botones **Descargar CV** y **Ver proyectos**. Todo con parallax.
3. **Sobre mí** — abre con una frase dispersa por la pantalla con letras que cambian (estilo Elissa), p. ej. "¿Por qué no construir software que se sienta un poco mágico?". Tu foto aparece dibujada con líneas moradas que se revelan al pasar el cursor (que dice "¡Hola!"). Luego: párrafo de 3–5 líneas, datos rápidos (📍 Pasto · 🎓 5.º semestre · intereses), stickers arrastrables con tus tecnologías.
4. **Proyectos** — (a) "Destacados": sección fija con el monitor que reproduce el video de cada proyecto y la lista que se resalta. (b) "Todos": carrusel en arco en escritorio / grid en celular. Cada proyecto: video/imagen, título, descripción, tags, **GitHub** y **Demo (Vercel)**. Cursor: "Ver proyecto".
5. **Testimonios** — mínimo 3 tarjetas (nombre, relación, avatar, texto) en banda horizontal infinita.
6. **Experiencia** — pestañas **Académica / Laboral**, línea de tiempo que se dibuja con el scroll.
7. **⭐ Skills** (sección adicional) — tarjetas moradas escalonadas por área (Frontend, Backend, Bases de datos, Herramientas).
8. **Contacto** — "Hablemos" + formulario (validación + confirmación) + correo, LinkedIn, GitHub.
9. **Footer** — links grandes, reloj en vivo de Pasto, volver arriba, © año, "Hecho con Next.js + Tailwind", fondo de píxeles WebGL.

### `/proyectos/[slug]` — Caso de estudio por proyecto (opcional, fase 2)
### `/lab` — Laboratorio (⭐ segunda sección adicional, estilo Eve + Andreas)
Lienzo infinito arrastrable con mini-herramientas propias:
- **Pixel Paint** — editor de pixel art que exporta PNG
- **Terminal** — consola con comandos (`help`, `whoami`, `projects`, `contact`); encaja con ingeniería de software
- **Shader Playground** — sliders que modifican el shader del hero en vivo
- **Filtros** — subir una foto y aplicarle efectos (pixelado, duotono morado, grano)

Empezamos con 2 (Terminal + Pixel Paint) y agregamos más si da el tiempo.

---

## 4. Identidad visual
- **Colores:** fondo negro cálido `#0B0A09` / `#1C1714`, texto crema `#F3EADF`, **acento morado** (tono de la referencia, ~`#9B5CF6`, a ajustar), morado oscuro para brillos.
- **Tipografía:** Outfit (titulares en mayúsculas) + Figtree (texto), igual que la referencia. Opcional: Newsreader itálica para acentos editoriales y Geist Mono para etiquetas y fechas.
- **Elementos propios:** cursor-etiqueta, stickers arrastrables, píxeles morados.

---

## 5. Fases de trabajo
| Fase | Entregable |
|---|---|
| F0 | Proyecto Next.js + TS + Tailwind, tokens de diseño, fuentes, repo en GitHub, primer deploy en Vercel |
| F1 | Base: Lenis, cursor personalizado, navbar responsive, loader |
| F2 | Hero: "hola" 3D + shader de cuadrícula + parallax + botón CV |
| F3 | Sobre mí, Experiencia, Testimonios, Skills, Contacto, Footer (con datos en `data/*.ts`) |
| F4 | Proyectos: sección destacada con video + carrusel/grid |
| F5 | `/lab` con lienzo infinito + Terminal + Pixel Paint; transiciones entre páginas |
| F6 | Responsive, accesibilidad, rendimiento, revisión con el checklist del profe |
| F7 | Contenido final (CV Harvard, testimonios, videos) y entrega |

---

## 6. Contenido pendiente (de Juano)
- [ ] Foto
- [ ] CV actual → lo rehacemos en **formato Harvard** (PDF)
- [ ] Links de GitHub de los proyectos (+ demos en Vercel si existen)
- [ ] Videos de proyectos (grabar con OBS; yo los comprimo y optimizo)
- [ ] Correo, LinkedIn, GitHub
- [ ] Experiencia académica y laboral relevante para software (definir juntos)
- [ ] 3+ testimonios (profes, compañeros, clientes)
