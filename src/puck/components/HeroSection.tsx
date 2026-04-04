import type { HeroSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function HeroSection(props: HeroSectionProps & ComponentMeta) {
  const {
    heading,
    subtext,
    badge,
    ctaText,
    ctaHref,
    ctaSecondaryText,
    ctaSecondaryHref,
    align,
    backgroundUrl,
    backgroundOverlay,
    padding,
    className,
    ...metaRest
  } = props;

  const paddingValue = padding || "96px";
  const isCenter = align === "center";

  const sectionStyle: React.CSSProperties = {
    ...(backgroundUrl
      ? {
          backgroundImage: backgroundOverlay
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`
            : `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {}),
    padding: `${paddingValue} 24px`,
    ...extractStyleProps(metaRest),
  };

  const hasBgOverride = "bgColor" in metaRest && metaRest.bgColor;

  return (
    <section
      className={`${backgroundUrl && !hasBgOverride ? "text-white" : !hasBgOverride ? "bg-background text-foreground" : ""} w-full ${className ?? ""}`}
      style={sectionStyle}
    >
      <div
        className={`max-w-4xl mx-auto ${isCenter ? "text-center" : "text-left"}`}
      >
        {badge && (
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          {heading}
        </h1>
        <p className="text-lg md:text-xl opacity-80 mb-8 max-w-2xl mx-auto">
          {subtext}
        </p>
        <div
          className={`flex gap-4 ${isCenter ? "justify-center" : "justify-start"}`}
        >
          <a
            href={ctaHref}
            className="inline-block bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition"
          >
            {ctaText}
          </a>
          {ctaSecondaryText && ctaSecondaryHref && (
            <a
              href={ctaSecondaryHref}
              className={`inline-block border rounded-lg px-6 py-3 font-semibold transition ${backgroundUrl ? "border-white/30 text-white hover:bg-white/10" : "border-border text-foreground hover:bg-muted"}`}
            >
              {ctaSecondaryText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
