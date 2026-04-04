import type { BannerProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function Banner(props: BannerProps & ComponentMeta) {
  const {
    heading,
    subtext,
    ctaText,
    ctaHref,
    variant = "gradient",
    backgroundUrl,
    align = "center",
    className,
    ...metaRest
  } = props;
  const isCenter = align === "center";

  // ── Variant classes ──────────────────────────────────────────────
  const variantClasses: Record<string, string> = {
    gradient: "bg-gradient-to-r from-primary to-primary/80 text-white",
    solid: "bg-primary text-primary-foreground",
    image: "text-white",
  };

  // ── Image variant: inline background with dark overlay ───────────
  const sectionStyle: React.CSSProperties =
    variant === "image" && backgroundUrl
      ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          ...extractStyleProps(metaRest),
        }
      : { ...extractStyleProps(metaRest) };

  return (
    <section
      className={`w-full py-12 px-6 ${variantClasses[variant] || variantClasses.gradient} ${className ?? ""}`}
      style={sectionStyle}
    >
      <div
        className={`max-w-3xl mx-auto ${isCenter ? "text-center" : "text-left"}`}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
        {subtext && (
          <p className="text-base md:text-lg opacity-80 mb-6 max-w-xl mx-auto">
            {subtext}
          </p>
        )}
        <div className={`flex ${isCenter ? "justify-center" : "justify-start"}`}>
          <a
            href={ctaHref}
            className="inline-block rounded-lg px-6 py-2.5 font-semibold transition hover:opacity-90 bg-white text-gray-900"
          >
            {ctaText}
          </a>
        </div>
      </div>
    </section>
  );
}
