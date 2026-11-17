import { Generate } from "@/components/ui/Generate";
import LineDrawing from "@/components/ui/LineDrawing";
import ScrambleWords from "@/components/ui/ScrambleWords";
import SectionHeading from "@/components/ui/SectionHeading";
import Stickers from "@/components/ui/Stickers";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";

/** Where each word of the manifesto sits on desktop (% of the stage). */
const WORD_POSITIONS = [
  { x: 14, y: 6 },
  { x: 26, y: 14 },
  { x: 20, y: 24 },
  { x: 66, y: 10 },
  { x: 72, y: 30 },
  { x: 80, y: 44 },
  { x: 8, y: 58 },
  { x: 18, y: 70 },
  { x: 70, y: 66 },
  { x: 62, y: 82 },
  { x: 76, y: 90 },
];

/** Median luminance of the JR logo's blue ground (measured from its edges: ~0.19). */
const LOGO_GROUND = 0.2;

export default function About() {
  const facts = [
    { k: "Based in", v: profile.city },
    { k: "Studying", v: profile.career },
    { k: "Currently", v: profile.semester },
  ];
  const tech = skills.flatMap((g) => g.items);

  return (
    <section id="about" className="px-4 py-32 md:px-10">
      {/* Stage: scrambling manifesto around a portrait drawn with lines */}
      <div className="relative mx-auto mb-24 flex max-w-7xl flex-col items-center gap-10 md:block md:h-[85svh]">
        <ScrambleWords
          words={profile.manifesto.split(" ")}
          positions={WORD_POSITIONS}
          className="w-full md:absolute md:inset-0"
        />
        {/* Desktop: the JR logo drawn with lines around the cursor (owner's choice);
            "light" traces the chrome letters. */}
        <LineDrawing
          src={profile.logo}
          trace="light"
          fallbackText={profile.initials}
          label={`${profile.displayName}'s JR monogram, drawn with lines`}
          className="hidden aspect-[3/4] md:absolute md:top-1/2 md:left-1/2 md:block md:h-[80%] md:w-auto md:-translate-x-1/2 md:-translate-y-1/2"
        />
        <span data-cursor="Hi!" aria-hidden className="absolute inset-x-1/4 inset-y-[10%] hidden md:block" />
        <p className="label absolute bottom-0 left-1/2 hidden -translate-x-1/2 text-stone md:block">
          ( Move your cursor over it to reveal the logo )
        </p>

        {/* Phones: no cursor, and the line drawing takes ages to build by itself,
            so the logo is generated on demand instead (owner's choice). */}
        <div className="flex flex-col items-center gap-3 md:hidden">
          {/* paper = luminance of the logo's blue ground, so the contrast turns about it */}
          <Generate src={profile.logo} alt={`${profile.displayName}'s JR logo`} paper={LOGO_GROUND} />
          <p className="label text-stone">( Tap Generate to draw my logo )</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        <SectionHeading title="About me" kicker="(02)" />
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xl leading-relaxed md:text-2xl">{profile.about}</p>

            <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.k} className="rounded-2xl border border-ink-3 p-4">
                  <dt className="label text-stone">{f.k}</dt>
                  <dd className="mt-1 font-display font-bold">{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="label mb-3 text-stone">Stack — drag them around</p>
            <Stickers items={tech} className="min-h-72 rounded-3xl border border-dashed border-ink-3 bg-ink-2/40" />
          </div>
        </div>
      </div>
    </section>
  );
}
