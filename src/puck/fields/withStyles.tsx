import type { ComponentConfig } from "@puckeditor/core";
import {
  StylesField,
  stylesToCss,
  hoverToCss,
  type StylesValue,
  type StylesFieldOptions,
} from "./StylesField";

export type { StylesValue, StylesFieldOptions };
export { stylesToCss };

export type WithStyles<P extends Record<string, unknown>> = P & {
  styles?: StylesValue;
};

export type WithStylesOptions = StylesFieldOptions & {
  /** Position in field list to insert styles field (default: last) */
  fieldPosition?: number;
};

/**
 * HOC that adds a comprehensive "Styles" accordion panel to any Puck component.
 * Supports Default + Hover states, background images, and CSS transitions.
 *
 * Usage:
 *   const StyledButton = withLayout(withStyles(ButtonInner));
 *   const StyledCard  = withStyles(CardInner, { disableTypography: true });
 */
export function withStyles<C extends ComponentConfig<any>>(
  config: C,
  options?: WithStylesOptions,
): C {
  const stylesField = {
    type: "custom" as const,
    render: ({ value, onChange }: { value: StylesValue; onChange: (val: StylesValue) => void }) => (
      <StylesField value={value} onChange={onChange} options={options} />
    ),
  };

  return {
    ...config,
    fields: {
      ...config.fields,
      styles: stylesField,
    },
    defaultProps: {
      ...config.defaultProps,
      styles: {},
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    render: (props: any) => {
      const styles: StylesValue | undefined = props.styles;
      const cssStyles = stylesToCss(styles);
      const hasStyles = Object.keys(cssStyles).length > 0;
      const cssClasses = styles?.cssClasses || "";

      // Hover CSS injection — generates a unique class + <style> tag
      const hoverClass = styles?.hover
        ? `ph-${props.id || Math.random().toString(36).slice(2, 8)}`
        : "";
      const hoverCss = hoverClass && styles?.hover ? hoverToCss(hoverClass, styles.hover) : undefined;

      const inner = config.render(props);

      if (!hasStyles && !cssClasses && !hoverClass) return inner;

      const className = [cssClasses, hoverClass].filter(Boolean).join(" ") || undefined;

      return (
        <div style={cssStyles} className={className}>
          {hoverCss && <style dangerouslySetInnerHTML={{ __html: hoverCss }} />}
          {inner}
        </div>
      );
    },
  };
}
