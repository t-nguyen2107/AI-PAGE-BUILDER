import type { ComponentConfig } from "@puckeditor/core";
import {
  stylesToCss,
  hoverToCss,
  type StylesValue,
} from "./StylesField";

export type { StylesValue };
export { stylesToCss };

export type WithStyles<P extends Record<string, unknown>> = P & {
  styles?: StylesValue;
};

/**
 * HOC that wraps a component's render to apply StylesValue as inline CSS.
 * Style editing is now handled by UnifiedInspector's Style tab.
 */
export function withStyles<C extends ComponentConfig<any>>(
  config: C,
): C {
  return {
    ...config,
    fields: {
      ...config.fields,
      // NOTE: "styles" field removed from config — now managed by UnifiedInspector Style tab
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
