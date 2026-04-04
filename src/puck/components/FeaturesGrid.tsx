import type { FeaturesGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function FeaturesGrid(props: FeaturesGridProps & ComponentMeta) {
  const { heading, subtext, columns, features, className, ...metaRest } = props;
  return (
    <section
      className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h2>
          {subtext && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtext}
            </p>
          )}
        </div>
        <div
          className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""}`}
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition"
            >
              {feature.icon && (
                <span className="material-symbols-outlined text-2xl text-primary mb-4 block">
                  {feature.icon}
                </span>
              )}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
