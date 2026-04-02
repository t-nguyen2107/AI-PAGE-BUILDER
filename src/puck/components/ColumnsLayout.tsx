import type { ColumnsLayoutProps } from "../types";

export function ColumnsLayout({ columns, gap, col1, col2, col3, col4 }: ColumnsLayoutProps) {
  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap}px`,
      }}
    >
      <div>{col1?.()}</div>
      <div>{col2?.()}</div>
      {columns >= 3 && col3 && <div>{col3()}</div>}
      {columns >= 4 && col4 && <div>{col4()}</div>}
    </div>
  );
}
