import type { FeatureShowcaseProps } from "../types";

export function FeatureShowcase({
  heading,
  subtext,
  imageUrl,
  features,
  imagePosition = "right",
  ctaText,
  ctaHref,
}: FeatureShowcaseProps) {
  const imageFirst = imagePosition === "left";

  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Image side */}
        <div
          className={`w-full md:w-1/2 ${
            imageFirst ? "md:order-1" : "md:order-2"
          }`}
        >
          <img
            src={imageUrl}
            alt={heading}
            className="w-full rounded-2xl object-cover"
          />
        </div>

        {/* Text side */}
        <div
          className={`w-full md:w-1/2 ${
            imageFirst ? "md:order-2" : "md:order-1"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg text-muted-foreground mb-8">{subtext}</p>
          )}

          <div className="space-y-6 mb-8">
            {features.map((feature, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {ctaText && ctaHref && (
            <a
              href={ctaHref}
              className="inline-block rounded-lg px-8 py-3 font-semibold bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
