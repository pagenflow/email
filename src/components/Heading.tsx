import { CSSProperties, memo, ReactNode } from "react";
import IInnerLink from "../types/IInnerLink";
import { arePropsEqual } from "../utils/memoUtils";
import { DataBindings } from "../types/DataBindings";
import { rootBindingProps } from "./utils/bindingAttribute";
import injectLinkStyles from "./utils/injectLinkStyles";

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

  /** Font family (e.g., 'Arial, sans-serif'). */
  fontFamily?: string;

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

  /** Word break behavior (e.g., 'break-all', 'break-word', 'keep-all', 'normal'). */
  wordBreak?: string;

  /** White space handling (e.g., 'nowrap', 'pre', 'pre-wrap', 'pre-line', 'normal'). */
  whiteSpace?: string;

  /** Inner link configuration for making the entire heading block clickable */
  innerLink?: IInnerLink;
}

export type HeadingProps = {
  config: HeadingConfig;
  devMode?: ReactNode;
  children?: ReactNode;
  bindings?: DataBindings;
};

// Helper to build link href based on innerLink type
function buildLinkHref(innerLink?: IInnerLink): string | null {
  if (!innerLink || innerLink.type === "none") return null;

  switch (innerLink.type) {
    case "url":
      return innerLink.url || null;
    case "email":
      return innerLink.email ? `mailto:${innerLink.email}` : null;
    case "phone":
      return innerLink.phone ? `tel:${innerLink.phone}` : null;
    case "anchor":
      return innerLink.anchor ? `#${innerLink.anchor}` : null;
    case "page_top":
      return "#top";
    case "page_bottom":
      return "#bottom";
    default:
      return null;
  }
}

function Heading({ config, devMode, children, bindings }: HeadingProps) {
  const {
    text,
    level = "h1",
    padding,
    color,
    textAlign,
    fontFamily,
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
    wordBreak,
    whiteSpace,
    innerLink,
  } = config;

  // Resolve href and target from innerLink
  const href = buildLinkHref(innerLink);
  const target = innerLink?.target || "_blank";

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
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    textTransform: textTransform as any,
    textDecoration: textDecoration,
    direction: direction as any,
    wordBreak: wordBreak as any,
    whiteSpace: whiteSpace as any,

    // Critical: Remove default top/bottom margin from HTML heading tags
    margin: "0",
    padding: "0",

    // Outlook specific fixes (using string indexing)
    ["msoLineHeightRule" as string]: "exactly",
  };

  const processedHtml = isString
    ? injectLinkStyles(content, headingStyle as Record<string, string>)
    : "";

  // Dynamically create the Heading element
  const HeadingTag = level;

  const headingElement = isString ? (
    <HeadingTag
      style={headingStyle}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  ) : (
    <HeadingTag style={headingStyle}>{content}</HeadingTag>
  );

  return (
    // Wrap the heading content in a table for padding/width/background management.
    <table
      aria-label="Heading Block Wrapper"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      {...rootBindingProps(bindings)}
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <tbody>
        <tr>
          {/* TD: Applies Padding, Background, and Alignment */}
          <td style={tdStyle} align={textAlign as "left" | "center" | "right"}>
            {href && !devMode ? (
              <a
                href={href}
                target={target}
                {...(target === "_blank" ? { rel: "noopener noreferrer" } : {})}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                {headingElement}
              </a>
            ) : (
              headingElement
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Heading, arePropsEqual);
