import type { FooterSectionProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function FooterSection(props: FooterSectionProps & ComponentMeta) {
  const { logo, description, linkGroups, copyright, className, ...metaRest } = props;
  const colCount = 1 + linkGroups.length;

  return (
    <footer
      className={`w-full bg-muted/50 border-t border-border text-foreground ${className ?? ""}`}
      style={extractStyleProps(metaRest)}
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div
          className={`grid gap-8 grid-cols-1 sm:grid-cols-2 ${colCount >= 3 ? "lg:grid-cols-3" : ""} ${colCount >= 4 ? "xl:grid-cols-4" : ""}`}
        >
          <div>
            {logo && <p className="font-bold text-xl mb-3">{logo}</p>}
            {description && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {linkGroups.map((group, i) => (
            <div key={i}>
              <p className="font-semibold mb-3 text-sm">{group.title}</p>
              <div className="flex flex-col gap-2">
                {group.links.map((link, j) => (
                  <a
                    key={j}
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {copyright && (
          <div className="mt-10 pt-6 border-t border-border text-center text-muted-foreground text-sm">
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
