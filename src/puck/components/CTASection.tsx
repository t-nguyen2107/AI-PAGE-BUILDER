import type { CTASectionProps } from "../types";

export function CTASection({ heading, subtext, ctaText, ctaHref, backgroundUrl }: CTASectionProps) {
  const hasBg = !!backgroundUrl;

  const sectionStyle: React.CSSProperties = hasBg
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <section
      className={`w-full py-20 px-6 ${hasBg ? "text-white" : "bg-primary text-primary-foreground"}`}
      style={sectionStyle}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
        {subtext && (
          <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">{subtext}</p>
        )}
        <a
          href={ctaHref}
          className={`inline-block rounded-lg px-8 py-3 font-semibold transition ${
            hasBg
              ? "bg-white text-gray-900 hover:bg-gray-100"
              : "bg-primary-foreground text-primary hover:opacity-90"
          }`}
        >
          {ctaText}
        </a>
      </div>
    </section>
  );
}
