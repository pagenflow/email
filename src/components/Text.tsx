import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

export interface TextConfig {
  /** The text content or React nodes to render. */
  text?: string;

  /** Padding around the text (applied to the containing TD). */
  padding?: string;

  /** Text color. */
  color?: string;

  /** Horizontal text alignment (e.g., 'left', 'center'). */
  textAlign?: "left" | "center" | "right" | "justify";

  /** Font size (e.g., '16px'). */
  fontSize?: string;

  /** Font weight (e.g., 'bold' or '700'). */
  fontWeight?: string;

  /** Font style (e.g., 'italic'). */
  fontStyle?: string;

  /** Line height (e.g., '1.5' or '24px'). */
  lineHeight?: string;

  /** Letter spacing (e.g., '0.5px', '1px'). */
  letterSpacing?: string;

  /** Text transform (e.g., 'uppercase', 'lowercase', 'capitalize'). */
  textTransform?: string;

  /** Text decoration (e.g., 'underline', 'line-through'). */
  textDecoration?: string;

  /** Text direction (e.g., 'ltr', 'rtl'). */
  direction?: string;

  /** Vertical alignment (e.g., 'sub', 'super'). */
  verticalAlign?: string;

  /** Background color of the text block. */
  backgroundColor?: string;

  /** Opacity of the text (e.g., '0.5', '1'). */
  opacity?: string | number;

  /** White space handling (e.g., 'normal', 'nowrap', 'pre', 'pre-wrap'). */
  whiteSpace?: string;
}

export type TextProps = {
  config: TextConfig;
  devMode?: ReactNode;
  children?: ReactNode;
};

function Text({ config, devMode, children }: TextProps) {
  const {
    text,
    padding,
    color,
    textAlign,
    fontSize,
    fontWeight,
    fontStyle,
    lineHeight,
    letterSpacing,
    textTransform,
    textDecoration,
    direction,
    verticalAlign,
    backgroundColor,
    opacity,
    whiteSpace,
  } = config;

  // 1. TD Style: Where padding and background are reliably applied.
  const tdStyle: CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    width: "100%",
    verticalAlign: "top",
  };

  // 2. Content Style: Applied directly to a wrapper element
  const contentStyle: CSSProperties = {
    color: color,
    textAlign: textAlign,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    textTransform: textTransform as any,
    textDecoration: textDecoration,
    direction: direction as any,
    verticalAlign: verticalAlign,
    opacity: opacity,
    whiteSpace: whiteSpace as any,
    margin: "0",
    padding: "0",
    fontFamily: "Arial, Helvetica, sans-serif",
  };

  // Determine content to render
  const content = text ?? children;
  const isString = typeof content === "string";

  return (
    <table
      aria-label="Text Block Wrapper"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <tbody>
        <tr>
          <td style={tdStyle} align={textAlign as "left" | "center" | "right"}>
            {isString ? (
              <div
                style={contentStyle}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div style={contentStyle}>{content}</div>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Text, arePropsEqual);
