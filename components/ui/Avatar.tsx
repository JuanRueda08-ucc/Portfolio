import { profile } from "@/data/profile";

type Props = { size?: number; className?: string };

/**
 * Profile photo if set; otherwise the personal JR logo, cropped into a circle
 * (zoomed in so the monogram fills it); the initials only as a last resort.
 */
export default function Avatar({ size = 56, className = "" }: Props) {
  const style = { width: size, height: size };
  const ring = "ring-2 ring-violet/60";

  if (profile.photo || profile.logo) {
    const isLogo = !profile.photo;
    return (
      <span style={style} className={`block shrink-0 overflow-hidden rounded-full ${ring} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo ?? profile.logo}
          alt={isLogo ? `${profile.displayName} JR logo` : `Photo of ${profile.displayName}`}
          width={size}
          height={size}
          className={`size-full object-cover ${isLogo ? "scale-[1.45]" : ""}`}
        />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${profile.displayName} avatar`}
      style={{ ...style, fontSize: size * 0.36 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_25%,var(--color-violet-bright),var(--color-violet-deep))] font-serif text-cream italic ${ring} ${className}`}
    >
      {profile.initials}
    </span>
  );
}
