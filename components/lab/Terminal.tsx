"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { experience } from "@/data/experience";
import { profile, socials } from "@/data/profile";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";

type Line = { id: number; content: ReactNode; kind?: "input" | "error" | "accent" };

const PROMPT = "juano@lab:~$";

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noopener noreferrer"
    className="text-violet-soft underline underline-offset-2"
  >
    {children}
  </a>
);

/** Every command returns the lines it prints. */
const COMMANDS: Record<string, { help: string; run: (args: string[]) => ReactNode[] | "clear" }> = {
  help: {
    help: "list commands",
    run: () =>
      Object.entries(COMMANDS).map(([name, c]) => (
        <span key={name}>
          <span className="text-violet-soft">{name.padEnd(10, " ")}</span>
          {c.help}
        </span>
      )),
  },
  whoami: {
    help: "who is this guy?",
    run: () => [`${profile.displayName} — ${profile.role}`, `${profile.career}, ${profile.semester} · ${profile.city}`],
  },
  about: { help: "short bio", run: () => [profile.about] },
  skills: {
    help: "what I work with",
    run: () => skills.map((g) => `${g.title.padEnd(12, " ")} ${g.items.join(", ")}`),
  },
  projects: {
    help: "list projects (projects <n> for links)",
    run: ([n]) => {
      if (n) {
        const p = projects[Number(n) - 1];
        if (!p) return [`no project #${n}`];
        return [
          `${p.title} (${p.year}) — ${p.description}`,
          `stack: ${p.tags.join(", ")}`,
          <span key="l">
            {p.demo && <><A href={p.demo}>live demo</A> · </>}<A href={p.github}>source</A>
          </span>,
        ];
      }
      return [...projects.map((p, i) => `${String(i + 1).padStart(2, "0")}  ${p.title}  [${p.tags.join(", ")}]`), "→ try: projects 1"];
    },
  },
  experience: {
    help: "education & work",
    run: () => experience.map((e) => `${e.type === "education" ? "🎓" : "💼"} ${e.start}–${e.end}  ${e.title} @ ${e.place}`),
  },
  contact: {
    help: "how to reach me",
    run: () => [
      <A key="m" href={`mailto:${profile.email}`}>
        {profile.email}
      </A>,
      ...socials.map((s) => (
        <A key={s.label} href={s.href}>
          {s.label}
        </A>
      )),
    ],
  },
  cv: { help: "download my CV", run: () => [<A key="cv" href={profile.cv}>cv.pdf ↓</A>] },
  date: { help: "time in Pasto", run: () => [new Date().toLocaleString("en-US", { timeZone: profile.timezone })] },
  echo: { help: "print text", run: (args) => [args.join(" ")] },
  ls: { help: "list files", run: () => ["about.txt  projects/  skills.json  cv.pdf  secret.txt"] },
  cat: {
    help: "read a file",
    run: ([f]) =>
      f === "about.txt"
        ? [profile.about]
        : f === "secret.txt"
          ? ["The 3D 'hello' on the home page is Pacifico, turned into glass. ✨"]
          : [`cat: ${f ?? ""}: no such file`],
  },
  sudo: { help: "try it", run: () => ["Nice try. This incident will be reported to the purple pixels. 👾"] },
  clear: { help: "clear the screen", run: () => "clear" },
};

const WELCOME: Line[] = [
  { id: 0, content: `Welcome to ${profile.displayName.split(" ")[0]}'s lab terminal.`, kind: "accent" },
  { id: 1, content: "Type 'help' to see what you can do. Tab autocompletes, ↑/↓ browse history." },
];

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const nextId = useRef(WELCOME.length);
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const push = (items: Omit<Line, "id">[]) =>
    setLines((prev) => [...prev, ...items.map((l) => ({ ...l, id: nextId.current++ }))]);

  const run = (raw: string) => {
    const [name, ...args] = raw.trim().split(/\s+/);
    if (raw.trim()) history.current.unshift(raw);
    cursor.current = -1;
    const echo = { content: `${PROMPT} ${raw}`, kind: "input" as const };
    if (!name) return push([echo]);
    const cmd = COMMANDS[name.toLowerCase()];
    if (!cmd) return push([echo, { content: `command not found: ${name} — try 'help'`, kind: "error" }]);
    const out = cmd.run(args);
    if (out === "clear") return setLines([]);
    push([echo, ...out.map((content) => ({ content }))]);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      cursor.current = Math.max(-1, Math.min(h.length - 1, cursor.current + (e.key === "ArrowUp" ? 1 : -1)));
      setValue(cursor.current === -1 ? "" : h[cursor.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = Object.keys(COMMANDS).find((c) => c.startsWith(value.trim().toLowerCase()));
      if (match && value.trim()) setValue(match + " ");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      ref={scroller}
      onClick={() => input.current?.focus()}
      className="h-full max-h-[70vh] min-h-80 overflow-y-auto bg-ink p-4 font-mono text-[13px] leading-relaxed md:h-[26rem]"
      data-lenis-prevent
    >
      {lines.map((l) => (
        <div
          key={l.id}
          className={`whitespace-pre-wrap ${
            l.kind === "input" ? "text-cream" : l.kind === "error" ? "text-red-400" : l.kind === "accent" ? "text-violet-bright" : "text-stone"
          }`}
        >
          {l.content}
        </div>
      ))}
      <label className="flex gap-2">
        <span className="shrink-0 text-violet-bright">{PROMPT}</span>
        <input
          ref={input}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Terminal command"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-cream caret-violet-bright outline-none"
        />
      </label>
    </div>
  );
}
