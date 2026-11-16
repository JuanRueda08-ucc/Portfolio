# Juano Rueda — Portfolio

Personal portfolio built for the **Interface Design** course.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · GSAP · Lenis · React Three Fiber · Motion · Vercel

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

```
app/            layout, home page and global styles (design tokens)
components/     one component per section (Navbar, Hero, About, Projects, …)
data/           typed content: profile, projects, testimonials, experience, skills
public/         cv.pdf, images and videos
docs/           course requirements and project plan (Spanish)
```

To update the content, edit the files in `data/`.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FORMSPREE_ID` | Formspree form ID. Without it, the contact form simulates sending. |
