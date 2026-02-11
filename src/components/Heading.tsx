import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

// Define the available HTML heading levels
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingConfig {
  /** The text content. */
  text?: ReactNode;

  /** HTML heading level (h1 through h6). */
  level?: HeadingLevel;

  /** Padding around the heading (e.g., "10px 0"). */
  padding?: string;

  /** Text color. */
  color?: string;

  /** Horizontal text alignment. */
  textAlign?: "left" | "center" | "right" | "justify";

  /** Font size (e.g., '24px'). Overrides default size for the level. */
  fontSize?: string;

  /** Font weight (e.g., 'normal', 'bold', or '700'). */
  fontWeight?: string;

  /** Font style (e.g., 'italic'). */
  fontStyle?: string;

  /** Line height (e.g., '1.3' or '30px'). */
  lineHeight?: string;

  /** Letter spacing (e.g., '0.5px', '1px'). */
  letterSpacing?: string;

  /** Text transform (e.g., 'uppercase', 'lowercase', 'capitalize'). */
  textTransform?: string;

  /** Text decoration (e.g., 'underline', 'line-through'). */
  textDecoration?: string;

  /** Text direction (e.g., 'ltr', 'rtl'). */
  direction?: string;

  /** Vertical alignment (e.g., 'sub', 'super'). Applied to content wrapper in Text, applied to TD here for alignment. */
  verticalAlign?: string;

  /** Background color of the heading block. */
  backgroundColor?: string;
}

export type HeadingProps = {
  config: HeadingConfig;
  devMode?: ReactNode;
  children?: ReactNode;
};

function Heading({ config, devMode, children }: HeadingProps) {
  const {
    text,
    level = "h1",
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
  } = config;

  // Determine the content to render
  const content = text ?? children;
  const isString = typeof content === "string";

  // 1. TD Style: Where padding, background, width, and verticalAlign are applied.
  const tdStyle: CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    width: "100%",
    verticalAlign: verticalAlign || "top",
  };

  // 2. Heading Tag Style: Applied directly to the H tag.
  const headingStyle: CSSProperties = {
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

    // Critical: Remove default top/bottom margin from HTML heading tags
    margin: "0",
    padding: "0",

    // Ensures compatibility with MSO/general font rendering
    fontFamily: "Arial, Helvetica, sans-serif",

    // Outlook specific fixes (using string indexing)
    ["msoLineHeightRule" as string]: "exactly",
  };

  // Dynamically create the Heading element
  const HeadingTag = level;

  return (
    // Wrap the heading content in a table for padding/width/background management.
    <table
      aria-label="Heading Block Wrapper"
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
          {/* TD: Applies Padding, Background, and Alignment */}
          <td style={tdStyle} align={textAlign as "left" | "center" | "right"}>
            {/* The actual Heading Tag with all inline styles */}
            {isString ? (
              <HeadingTag
                style={headingStyle}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <HeadingTag style={headingStyle}>{content}</HeadingTag>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Heading, arePropsEqual);
