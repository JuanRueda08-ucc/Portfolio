type Props = {
  title: string;
  /** Small text on the right, e.g. "(01 / 04)" */
  meta?: string;
  kicker?: string;
};

export default function SectionHeading({ title, meta, kicker }: Props) {
  return (
    <div className="mb-12 flex items-end justify-between gap-6">
      <div>
        {kicker && (
          <p className="mb-3 font-mono text-xs tracking-widest text-violet-soft uppercase">
            {kicker}
          </p>
        )}
        <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {title}
        </h2>
      </div>
      {meta && <span className="font-mono text-xs text-stone">{meta}</span>}
    </div>
  );
}
