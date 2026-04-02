import type { StatsSectionProps } from "../types";

export function StatsSection({ heading, stats, columns }: StatsSectionProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {heading}
          </h2>
        )}
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
