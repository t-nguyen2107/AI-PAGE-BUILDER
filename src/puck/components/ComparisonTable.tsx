import type { ComparisonTableProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

function formatCellValue(value: string): string {
  const lower = value.toLowerCase().trim();
  if (lower === "yes" || lower === "true" || lower === "1" || lower === "✓" || lower === "check") return "\u2713";
  if (lower === "" || lower === "no" || lower === "false" || lower === "0" || lower === "—" || lower === "-") return "\u2014";
  return value;
}

export function ComparisonTable(props: ComparisonTableProps & ComponentMeta) {
  const { heading, plans, features, className, ...metaRest } = props;
  return (
    <section className={`w-full py-20 px-6 bg-background text-foreground ${className ?? ""}`} style={extractStyleProps(metaRest)}>
      <div className="max-w-6xl mx-auto">
        {heading && (
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            {heading}
          </h2>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground">
                  Features
                </th>
                {plans.map((plan, i) => (
                  <th
                    key={i}
                    className={`text-center px-6 py-4 font-semibold ${
                      plan.highlighted ? "bg-primary/5 text-primary" : ""
                    }`}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {features.map((feature, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-6 py-4 font-medium">{feature.name}</td>
                  {plans.map((plan, colIdx) => (
                    <td
                      key={colIdx}
                      className={`text-center px-6 py-4 ${
                        plan.highlighted ? "bg-primary/5" : ""
                      }`}
                    >
                      {formatCellValue(feature.values[colIdx] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
