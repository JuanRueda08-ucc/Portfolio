# Cómo cargar tu contenido real

Todo el contenido del portafolio vive en la carpeta `data/`. No hace falta tocar componentes ni estilos: cambias los archivos de datos y el sitio se actualiza solo.

Busca `TODO(Juano)` en el proyecto para ver lo que falta.

> El sitio es **bilingüe (inglés y español)**: cada texto va en inglés en su campo normal y en español dentro de `es: { … }` en el mismo elemento (si falta, se muestra el inglés). Si me lo pasas solo en español, yo lo traduzco.

---

## 1. Perfil — `data/profile.ts`

| Campo | Qué poner |
|---|---|
| `displayName` | Cómo quieres aparecer (hoy: "Juano Rueda") |
| `role` | Tu rol, p. ej. "Software Engineering Student" |
| `tagline` | Frase corta bajo tu nombre en el hero |
| `email` | Tu correo real (aparece en Contacto, Footer y Terminal) |
| `photo` | `"/images/me.jpg"` cuando subas tu foto (ver abajo) |
| `about` | Tu presentación: 3–5 líneas, en primera persona |
| `manifesto` | La frase dispersa con letras que cambian en "About" |
| `socials` | GitHub y LinkedIn (LinkedIn ya está puesto) |

### Foto
1. Guarda tu foto como `public/images/me.jpg` (vertical, idealmente 3:4, mínimo 900 px de alto, fondo simple).
2. En `profile.ts` cambia `photo: undefined` por `photo: "/images/me.jpg"`.
3. El retrato hecho de líneas usará tu foto en vez de las iniciales "JR". Funciona mejor con buen contraste (cara clara sobre fondo oscuro o al revés).

### CV
Guarda tu hoja de vida como `public/cv.pdf`. Todos los botones "Download CV" ya apuntan ahí. (Te ayudo a rehacerla en formato Harvard cuando me pases la actual.)

---

## 2. Proyectos — `data/projects.ts`

Cada proyecto es un objeto así:

```ts
{
  slug: "mi-proyecto",            // id único, sin espacios ni tildes
  title: "Mi Proyecto",
  description: "Qué problema resuelve y cómo, en 1–2 líneas.",
  year: 2026,
  tags: ["Next.js", "TypeScript"],
  github: "https://github.com/JuanRueda08-ucc/mi-proyecto",   // OBLIGATORIO (profe)
  demo: "https://mi-proyecto.vercel.app",                     // OBLIGATORIO (profe)
  image: "/images/projects/mi-proyecto.jpg",  // opcional
  video: "/videos/mi-proyecto.mp4",           // opcional (tiene prioridad sobre la imagen)
  featured: true,                              // aparece en "Featured work" (elige 2–4)
  hue: 268,                                    // color de la portada si no hay imagen/video
}
```

- **Orden:** el orden del arreglo es el orden en el sitio.
- **Imágenes:** `public/images/projects/<slug>.jpg`, horizontal 16:10 o 4:3, ~1600 px de ancho.
- **Videos:** `public/videos/<slug>.mp4`, 10–20 segundos, sin audio, 1280 px de ancho. Grábalos con OBS mostrando el proyecto en uso. Pásamelos y yo los comprimo (deben pesar < 3 MB cada uno).

---

## 3. Experiencia — `data/experience.ts`

El profe exige **académica y laboral**. Ordena de más reciente a más antigua.

```ts
{ type: "education", title: "B.S. in Software Engineering", place: "Universidad …", start: "2024", end: "Present", description: "…" }
{ type: "work", title: "Freelance Developer", place: "…", start: "2025", end: "Present", description: "…" }
```

Si aún no tienes empleos de software, en "work" puedes poner: freelance, monitorías, proyectos para clientes reales, prácticas, hackatones o voluntariados técnicos.

---

## 4. Testimonios — `data/testimonials.ts`

Mínimo **3** (requisito). Pide a profesores, compañeros o clientes 1–3 frases.

```ts
{ name: "Nombre Apellido", relation: "Professor", quote: "…", avatar: "/images/testimonials/nombre.jpg" }
```

`avatar` es opcional; sin él se muestran las iniciales.

---

## 5. Habilidades — `data/skills.ts`

Cuatro grupos (Frontend, Backend, Data, Tooling). Cambia `items` por tus tecnologías reales. Las mismas aparecen como stickers arrastrables en "About" y en la Terminal del Lab.

---

## 6. Formulario de contacto (Formspree)

1. Crea una cuenta gratis en formspree.io y un formulario nuevo.
2. Copia el ID (lo que va después de `/f/` en la URL del formulario).
3. En Vercel → tu proyecto → **Settings → Environment Variables**, agrega `NEXT_PUBLIC_FORMSPREE_ID` con ese ID y vuelve a desplegar.
4. Para probar en local, crea `.env.local` con `NEXT_PUBLIC_FORMSPREE_ID=tu_id`.

Sin esa variable, el formulario funciona pero solo simula el envío.

---

## Checklist rápido

- [ ] `profile.ts`: correo, about, foto
- [ ] `public/cv.pdf`
- [ ] `projects.ts`: proyectos reales con GitHub + demo, 2–4 `featured`
- [ ] Imágenes / videos de proyectos
- [ ] `experience.ts`: académica + laboral
- [ ] `testimonials.ts`: 3 o más
- [ ] `skills.ts`: tus tecnologías
- [ ] Formspree configurado en Vercel
