import type { PricingTableProps } from "../types";

export function PricingTable({ heading, subtext, plans }: PricingTableProps) {
  return (
    <section className="w-full py-20 px-6 bg-background text-foreground">
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
          className="grid gap-6 items-start"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-2xl border bg-card transition ${
                plan.highlighted
                  ? "ring-2 ring-primary scale-105 border-primary shadow-lg"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Popular
                </span>
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">/{plan.period}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm">
                    <span className="text-primary font-bold">&#10003;</span>
                    {typeof feature === "string" ? feature : feature.value}
                  </li>
                ))}
              </ul>
              <a
                href={plan.ctaHref}
                className={`block text-center rounded-lg px-6 py-3 font-semibold transition ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
