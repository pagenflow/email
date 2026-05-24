import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import injectLinkStyles from "./utils/injectLinkStyles";
import IInnerLink from "../types/IInnerLink";
import { DataBindings } from "../types/DataBindings";
import { bindingProps, rootBindingProps } from "./utils/bindingAttribute";

export interface TextConfig {
  /** The text content or React nodes to render. */
  text?: string;

  /** Padding around the text (applied to the containing TD). */
  padding?: string;

  /** Text color. */
  color?: string;

  /** Horizontal text alignment (e.g., 'left', 'center'). */
  textAlign?: "left" | "center" | "right" | "justify";

  /** Font family (e.g., 'Arial, sans-serif'). */
  fontFamily?: string;

  /** Font size (e.g., '16px'). */
  fontSize?: string;

  /** Font weight (e.g., 'bold' or '700'). */
  fontWeight?: string;

  /** Font style (e.g., 'italic'). */
  fontStyle?: string;

  /** Line height (e.g., '1.5' or '24px'). */
  lineHeight?: string | number;

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

  /** Word break behavior (e.g., 'break-all', 'break-word', 'keep-all', 'normal'). */
  wordBreak?: string;

  /**
   * Constrains the text block width in modern clients via CSS, and in
   * Outlook Classic (Word rendering engine) via a <center> + table `width`
   * HTML attribute pattern — identical to the Column maxWidth approach.
   * The outer table always stays at 100% so no retro layout is disturbed;
   * only the inner constrained table is capped.
   */
  maxWidth?: string;

  listStyle?: string;

  /** Inner link configuration for making the entire text block clickable */
  innerLink?: IInnerLink;
}

export type TextProps = {
  config: TextConfig;
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

function Text({ config, devMode, children, bindings }: TextProps) {
  const {
    text,
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
    opacity,
    whiteSpace,
    wordBreak = "break-all",
    maxWidth,
    innerLink,
  } = config;

  // Resolve href and target from innerLink
  const href = buildLinkHref(innerLink);
  const target = innerLink?.target || "_blank";

  // 1. TD Style: Where padding and background are reliably applied.
  //    When maxWidth is set, this TD stays at width: 100% so it always fills
  //    its parent — the inner maxWidth table (see below) does the actual
  //    capping, keeping the outer layout intact in all clients.
  const tdStyle: CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    width: "100%",
    verticalAlign: "top",
  };

  // 2. Content Style: Applied directly to the inner div wrapper.
  //    maxWidth is intentionally omitted here — putting it on a div has no
  //    effect in Outlook Classic (Word engine ignores CSS on div elements).
  //    The constraint is enforced at the table level instead (see below).
  const contentStyle: CSSProperties = {
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
    verticalAlign: verticalAlign,
    opacity: opacity,
    whiteSpace: whiteSpace as any,
    wordBreak: wordBreak as any,
    margin: "0",
    padding: "0",
  };

  // 3. maxWidth constraining table style (modern clients).
  //    The `width` HTML attribute on this table is what Outlook Classic
  //    (Word engine) reads — it has no concept of max-width, but it does
  //    honour the `width` attribute as a hard column cap.
  //    The CSS max-width here handles modern web/email clients correctly.
  //    <center> around it ensures the constrained block stays horizontally
  //    centred in both the Word engine and standards-based renderers.
  const maxWidthTableStyle: CSSProperties = {
    width: "100%",
    maxWidth: maxWidth,
    borderCollapse: "collapse",
  };

  // Determine content to render
  const content = text ?? children;
  const isString = typeof content === "string";

  const processedHtml = isString
    ? injectLinkStyles(content, contentStyle as Record<string, string>)
    : "";

  const innerContent = isString ? (
    <div
      style={contentStyle}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  ) : (
    <div style={contentStyle}>{content}</div>
  );

  const wrappedContent = maxWidth ? (
    /*
     * maxWidth wrapper — Outlook Classic compatibility pattern:
     *
     * <center> instructs the Word rendering engine to horizontally
     * centre its child block, equivalent to margin: 0 auto in CSS.
     *
     * The inner table carries the `width` HTML attribute set to the
     * maxWidth value. Outlook Classic reads `width` as a hard pixel
     * cap; it has no concept of max-width so this is the only lever
     * available. Modern clients receive the CSS max-width on the
     * same table and behave correctly.
     *
     * The outer TD remains at width: 100% so it always fills its
     * parent cell in every client — only the inner content is capped.
     */
    <center>
      <table
        aria-label="Text Max Width Wrapper"
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        width={maxWidth}
        style={maxWidthTableStyle}
      >
        <tbody>
          <tr>
            <td>{innerContent}</td>
          </tr>
        </tbody>
      </table>
    </center>
  ) : (
    innerContent
  );

  return (
    <table
      aria-label="Text Block Wrapper"
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
                {wrappedContent}
              </a>
            ) : (
              wrappedContent
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Text, arePropsEqual);
