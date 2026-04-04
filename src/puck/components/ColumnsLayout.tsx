import type { ColumnsLayoutProps, ComponentMeta } from "../types";
import { extractStyleProps } from "../lib/style-override";

export function ColumnsLayout(props: ColumnsLayoutProps & ComponentMeta) {
  const { columns, gap, col1, col2, col3, col4, className, ...metaRest } = props;

  const inlineStyle: React.CSSProperties = {
    gap: `${gap}px`,
    ...extractStyleProps(metaRest),
  };

  return (
    <div
      className={`grid w-full grid-cols-1 md:grid-cols-2 ${columns >= 3 ? "lg:grid-cols-3" : ""} ${columns >= 4 ? "xl:grid-cols-4" : ""} ${className ?? ""}`}
      style={inlineStyle}
    >
      <div>{col1?.()}</div>
      <div>{col2?.()}</div>
      {columns >= 3 && col3 && <div>{col3()}</div>}
      {columns >= 4 && col4 && <div>{col4()}</div>}
    </div>
  );
}
