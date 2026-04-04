import type { SocialProofProps } from "../types";

export function SocialProof({
  heading,
  stats,
  logos,
  showAvatars,
  avatarCount = 5,
  testimonialText,
}: SocialProofProps) {
  return (
    <section className="w-full py-16 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
            {heading}
          </h2>
        )}

        {showAvatars && (
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="flex -space-x-3">
              {Array.from({ length: avatarCount }).map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              +{avatarCount} users
            </span>
          </div>
        )}

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-10 mb-10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {logos && logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-10 mb-10">
            {logos.map((logo, i) => (
              <img
                key={i}
                src={logo.imageUrl}
                alt={logo.name}
                className="h-10 grayscale opacity-60 hover:opacity-100 transition"
              />
            ))}
          </div>
        )}

        {testimonialText && (
          <div className="max-w-3xl mx-auto text-center">
            <span className="block text-5xl text-primary/30 font-serif leading-none mb-2">
              &ldquo;
            </span>
            <p className="italic text-lg leading-relaxed text-muted-foreground">
              {testimonialText}
            </p>
            <span className="block text-5xl text-primary/30 font-serif leading-none mt-2">
              &rdquo;
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
