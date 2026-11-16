import { profile } from "@/data/profile";

type Props = { size?: number; className?: string };

/** Profile photo, or a purple monogram until `profile.photo` is set. */
export default function Avatar({ size = 56, className = "" }: Props) {
  const style = { width: size, height: size };
  if (profile.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.photo}
        alt={`Photo of ${profile.displayName}`}
        width={size}
        height={size}
        style={style}
        className={`shrink-0 rounded-full object-cover ring-2 ring-violet/60 ${className}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`${profile.displayName} avatar`}
      style={{ ...style, fontSize: size * 0.36 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--color-violet-bright),var(--color-violet-deep))] font-serif text-cream italic ring-2 ring-violet/60 ${className}`}
    >
      {profile.initials}
    </span>
  );
}
