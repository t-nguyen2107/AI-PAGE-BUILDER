import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { ComponentConfig, ObjectField } from "@puckeditor/core";

// ─── Layout field props ────────────────────────────────────────────────

export type LayoutFieldProps = {
  padding?: string;
  spanCol?: number;
  spanRow?: number;
  grow?: boolean;
};

export type WithLayout<P extends Record<string, unknown>> = P & {
  layout?: LayoutFieldProps;
};

// ─── Layout field definition ───────────────────────────────────────────

export const layoutField: ObjectField<LayoutFieldProps> = {
  type: "object",
  objectFields: {
    spanCol: {
      label: "Grid Columns",
      type: "number",
      min: 1,
      max: 12,
    },
    spanRow: {
      label: "Grid Rows",
      type: "number",
      min: 1,
      max: 12,
    },
    grow: {
      label: "Flex Grow",
      type: "radio",
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    },
    padding: {
      type: "select",
      label: "Vertical Padding",
      options: [
        { label: "0px", value: "0px" },
        { label: "8px", value: "8px" },
        { label: "16px", value: "16px" },
        { label: "24px", value: "24px" },
        { label: "32px", value: "32px" },
        { label: "48px", value: "48px" },
        { label: "64px", value: "64px" },
        { label: "96px", value: "96px" },
      ],
    },
  },
};

// ─── Layout wrapper component ──────────────────────────────────────────

type LayoutProps = WithLayout<{
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}>;

const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, layout, style }, ref) => {
    return (
      <div
        className={className}
        style={{
          gridColumn: layout?.spanCol
            ? `span ${Math.max(Math.min(layout.spanCol, 12), 1)}`
            : undefined,
          gridRow: layout?.spanRow
            ? `span ${Math.max(Math.min(layout.spanRow, 12), 1)}`
            : undefined,
          paddingTop: layout?.padding,
          paddingBottom: layout?.padding,
          flex: layout?.grow ? "1 1 0" : undefined,
          ...style,
        }}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);

Layout.displayName = "Layout";

export { Layout };

// ─── withLayout HOC ────────────────────────────────────────────────────

export function withLayout<C extends ComponentConfig<any>>(config: C): C {
  return {
    ...config,
    fields: {
      ...config.fields,
      layout: layoutField,
    },
    defaultProps: {
      ...config.defaultProps,
      layout: {
        spanCol: 1,
        spanRow: 1,
        padding: "0px",
        grow: false,
        ...(config.defaultProps?.layout as LayoutFieldProps | undefined),
      },
    },
    resolveFields: (_, params) => {
      const baseFields = { ...config.fields };

      if (params.parent?.type === "Grid") {
        return {
          ...baseFields,
          layout: {
            ...layoutField,
            objectFields: {
              spanCol: layoutField.objectFields.spanCol,
              spanRow: layoutField.objectFields.spanRow,
              padding: layoutField.objectFields.padding,
            },
          },
        };
      }

      if (params.parent?.type === "Flex") {
        return {
          ...baseFields,
          layout: {
            ...layoutField,
            objectFields: {
              grow: layoutField.objectFields.grow,
              padding: layoutField.objectFields.padding,
            },
          },
        };
      }

      return {
        ...baseFields,
        layout: {
          ...layoutField,
          objectFields: {
            padding: layoutField.objectFields.padding,
          },
        },
      };
    },
    render: (props: any) => (
      <Layout
        layout={props.layout as LayoutFieldProps}
        ref={props.puck?.dragRef}
      >
        {config.render(props)}
      </Layout>
    ),
  };
}
