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
          <p className="label mb-3 text-violet-soft">
            {kicker}
          </p>
        )}
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
          {title}
        </h2>
      </div>
      {meta && <span className="label text-stone">{meta}</span>}
    </div>
  );
}
