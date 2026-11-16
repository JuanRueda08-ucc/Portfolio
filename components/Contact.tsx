"use client";

import { useState, type FormEvent } from "react";
import SocialIcon from "@/components/ui/SocialIcon";
import SplitReveal from "@/components/ui/SplitReveal";
import { profile, socials } from "@/data/profile";

type Status = "idle" | "sending" | "sent" | "error";

// With NEXT_PUBLIC_FORMSPREE_ID the form posts to Formspree; otherwise sending is simulated.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      if (FORMSPREE_ID) {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error();
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-2xl border border-ink-3 bg-ink-2 px-4 py-3 outline-none transition-colors placeholder:text-stone/60 focus:border-violet";

  return (
    <section id="contact" className="px-4 py-32 md:px-10">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2">
        <div>
          <p className="label mb-3 text-violet-soft">(07)</p>
          <SplitReveal className="font-display text-6xl font-bold tracking-tight md:text-8xl">
            Let&apos;s talk<span className="text-violet">.</span>
          </SplitReveal>
          <a href={`mailto:${profile.email}`} data-cursor="Say hi" className="mt-8 inline-block text-xl underline decoration-violet underline-offset-4">
            {profile.email}
          </a>
          <ul className="mt-6 flex flex-wrap gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full border border-ink-3 px-4 py-2 text-stone transition-colors hover:border-violet hover:text-cream"
                >
                  <SocialIcon name={s.label} className="size-4" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-2 text-sm">
            Name
            <input name="name" required minLength={2} placeholder="Your name" className={field} />
          </label>
          <label className="grid gap-2 text-sm">
            Email
            <input name="email" type="email" required placeholder="you@email.com" className={field} />
          </label>
          <label className="grid gap-2 text-sm">
            Message
            <textarea name="message" required minLength={10} rows={5} placeholder="Hi! I'd love to…" className={field} />
          </label>
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-violet py-3.5 btn-text text-ink transition-opacity disabled:opacity-60"
          >
            {status === "sending" ? "Sending…" : "Send message"}
          </button>
          <p role="status" aria-live="polite" className="min-h-6 text-sm">
            {status === "sent" && <span className="text-violet-soft">Message sent! I&apos;ll get back to you soon.</span>}
            {status === "error" && (
              <span className="text-red-400">Something went wrong. Try again or email me directly.</span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
