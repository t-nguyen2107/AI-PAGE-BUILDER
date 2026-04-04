import type { TestimonialSectionProps } from "../types";

export function TestimonialSection({ heading, testimonials }: TestimonialSectionProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {heading}
          </h2>
        )}
        <div
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <span className="block text-4xl text-primary/30 font-serif leading-none mb-2">
                &ldquo;
              </span>
              <p className="italic text-lg leading-relaxed mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                    {t.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{t.author}</p>
                  <p className="text-muted-foreground text-sm">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
