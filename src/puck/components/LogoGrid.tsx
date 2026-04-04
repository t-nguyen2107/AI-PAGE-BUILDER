import type { LogoGridProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function LogoGrid(props: LogoGridProps & ComponentMeta) {
  const { heading, logos, className, ...metaRest } = props;
  return (
    <section
      className={`w-full py-16 px-6 bg-background text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-2xl font-semibold text-center mb-10">{heading}</h2>
        )}
        <div className="flex flex-wrap items-center justify-center gap-10">
          {logos.map((logo, i) => (
            <img
              key={i}
              src={logo.imageUrl}
              alt={logo.name}
              className="h-10 grayscale opacity-60 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
