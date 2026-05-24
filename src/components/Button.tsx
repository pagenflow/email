import { CSSProperties, memo, ReactNode } from "react";
import { BorderConfig } from "../types";
import IInnerLink from "../types/IInnerLink";
import { arePropsEqual } from "../utils/memoUtils";
import { DataBindings } from "../types/DataBindings";
import { rootBindingProps } from "./utils/bindingAttribute";

// Helper for alignment
type TdAlign = "center" | "left" | "right";

export interface ButtonConfig {
  /** Link configuration for the button destination. Required. */
  innerLink?: IInnerLink;

  /**
   * @deprecated Use innerLink property instead
   */
  href?: string;

  /** Button text. */
  children: ReactNode;

  /** Background color. Required for VML compatibility. */
  backgroundColor?: string;

  /** Text color. */
  color?: string;

  /** Padding for the button area (e.g., "12px 24px"). */
  padding?: string;

  /** Border radius (e.g., "3px"). */
  borderRadius?: string;

  /** Border configuration for outline buttons. */
  border?: BorderConfig;

  /** Width of the button (e.g., "200px" or "100%"). */
  width?: string;

  /** Maximum width of the button (e.g., "300px"). Text will wrap if content exceeds this. */
  maxWidth?: string;

  /** Horizontal alignment within the container. */
  justifyContent?: "start" | "center" | "end";

  /** Horizontal text alignment within the button (e.g., 'left', 'center'). */
  textAlign?: "left" | "center" | "right" | "justify";

  /** Font size (e.g., '16px'). */
  fontSize?: string;

  /** Font weight (e.g., 'bold' or '700'). */
  fontWeight?: string;

  /** Font style (e.g., 'italic'). */
  fontStyle?: string;

  /** Font family (e.g., 'Arial, sans-serif'). */
  fontFamily?: string;

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

  /** Vertical alignment of text (e.g., 'sub', 'super'). */
  verticalAlign?: string;

  /** Opacity of the button text (e.g., '0.5', '1'). */
  opacity?: string | number;

  /** White space behavior (e.g., 'normal', 'nowrap', 'pre-wrap'). */
  whiteSpace?: string;

  /** Word break behavior (e.g., 'break-all', 'break-word', 'keep-all', 'normal'). */
  wordBreak?: string;
}

export type ButtonProps = {
  config: ButtonConfig;
  devMode?: boolean;
  bindings?: DataBindings;
};

// Map alignment to HTML 'align' attribute
const justifyMap: Record<
  NonNullable<ButtonConfig["justifyContent"]>,
  TdAlign
> = {
  start: "left",
  center: "center",
  end: "right",
};

// Helper to build link href based on innerLink type (mirrors Icon component)
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

function getBorderStyleString(border?: BorderConfig): string {
  if (!border) return "";

  const styles: string[] = [];

  // If a full border is specified, apply it
  if (border.width && border.style && border.color) {
    styles.push(`border: ${border.width} ${border.style} ${border.color};`);
  } else {
    // If only individual borders are specified
    const hasIndividualBorders =
      border.top || border.right || border.bottom || border.left;

    if (hasIndividualBorders) {
      // Default all borders to none
      styles.push("border-top: none;");
      styles.push("border-right: none;");
      styles.push("border-bottom: none;");
      styles.push("border-left: none;");
    }
  }

  // Override with specific borders if provided
  if (border.top) {
    styles.push(
      `border-top: ${border.top.width} ${border.top.style} ${border.top.color};`,
    );
  }
  if (border.right) {
    styles.push(
      `border-right: ${border.right.width} ${border.right.style} ${border.right.color};`,
    );
  }
  if (border.bottom) {
    styles.push(
      `border-bottom: ${border.bottom.width} ${border.bottom.style} ${border.bottom.color};`,
    );
  }
  if (border.left) {
    styles.push(
      `border-left: ${border.left.width} ${border.left.style} ${border.left.color};`,
    );
  }

  return styles.join(" ");
}

function Button({ config, devMode, bindings }: ButtonProps) {
  const {
    innerLink,
    children,
    backgroundColor,
    color,
    padding,
    borderRadius,
    border,
    width,
    maxWidth,
    justifyContent,
    textAlign,
    fontSize,
    fontWeight,
    fontStyle,
    fontFamily,
    lineHeight,
    letterSpacing,
    textTransform,
    textDecoration,
    direction,
    verticalAlign,
    opacity,
    whiteSpace,
    wordBreak,
  } = config;

  // Resolve href from innerLink
  const href = buildLinkHref(innerLink);
  const target = innerLink?.target || "_blank";

  // Sanitize fontFamily early so safeFontFamily is available for all paths below.
  const safeFontFamily = fontFamily
    ? fontFamily.replace(/['"]/g, "")
    : fontFamily;

  // Outer TD Style for Background and Border Radius (no border)
  const backgroundTdStyle: CSSProperties = {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    width: width || "auto",
    ...(maxWidth && { maxWidth: maxWidth }),
    // Overflow hidden to clip background to border-radius
    ...(borderRadius && { overflow: "hidden" }),
  };

  // Border styles
  const borderStyleString = getBorderStyleString(border);

  const align = justifyContent ? justifyMap[justifyContent] : undefined;

  // --- Simple Outlook Approach for Percentage Widths ---
  let simpleOutlookButton = "";

  // Build consistent inline styles for text properties
  const textDecorationStyle =
    textDecoration && textDecoration !== "none"
      ? `text-decoration: ${textDecoration};`
      : "";
  const fontStyleProp = fontStyle ? `font-style: ${fontStyle};` : "";
  const letterSpacingProp = letterSpacing
    ? `letter-spacing: ${letterSpacing};`
    : "";
  const textTransformProp = textTransform
    ? `text-transform: ${textTransform};`
    : "";
  const whiteSpaceProp = whiteSpace ? `white-space: ${whiteSpace};` : "";
  const directionProp = direction ? `direction: ${direction};` : "";
  const opacityProp = opacity !== undefined ? `opacity: ${opacity};` : "";
  const wordBreakProp = wordBreak ? `word-break: ${wordBreak};` : "";

  // Border radius is intentionally omitted from the Outlook Classic table cell.
  // Outlook Classic ignores border-radius on table cells anyway, and including it
  // can cause unexpected rendering artifacts, so we explicitly leave it out.
  simpleOutlookButton = `
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
      <tr>
        <td ${align ? `align="${align}"` : ""} style="padding: 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width || "auto"}" style="border-collapse: collapse;">
            <tr>
              <td ${backgroundColor ? `bgcolor="${backgroundColor}"` : ""} ${textAlign ? `align="${textAlign}"` : ""} style="${padding ? `padding: ${padding};` : ""} ${href ? "cursor: pointer;" : ""} ${textAlign ? `text-align: ${textAlign};` : ""} ${borderStyleString}">
                ${
                  href
                    ? `<a href="${href}" target="${target}" rel="noopener noreferrer" style="${color ? `color: ${color};` : ""} ${textDecorationStyle} display: block; ${safeFontFamily ? `font-family: ${safeFontFamily};` : ""} ${fontSize ? `font-size: ${fontSize};` : ""} ${fontWeight ? `font-weight: ${fontWeight};` : ""} ${fontStyleProp} ${lineHeight ? `line-height: ${lineHeight};` : ""} ${letterSpacingProp} ${textTransformProp} ${textAlign ? `text-align: ${textAlign};` : ""} ${whiteSpaceProp} ${directionProp} ${opacityProp} ${wordBreakProp} mso-line-height-rule: exactly;">
                        ${typeof children === "string" ? children : ""}
                      </a>`
                    : `<span style="${color ? `color: ${color};` : ""} ${textDecorationStyle} display: block; ${safeFontFamily ? `font-family: ${safeFontFamily};` : ""} ${fontSize ? `font-size: ${fontSize};` : ""} ${fontWeight ? `font-weight: ${fontWeight};` : ""} ${fontStyleProp} ${lineHeight ? `line-height: ${lineHeight};` : ""} ${letterSpacingProp} ${textTransformProp} ${textAlign ? `text-align: ${textAlign};` : ""} ${whiteSpaceProp} ${directionProp} ${opacityProp} ${wordBreakProp} mso-line-height-rule: exactly;">
                        ${typeof children === "string" ? children : ""}
                      </span>`
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <![endif]-->
  `;

  // Build shared inline style fragments for the non-MSO path.
  // fontFamily uses the sanitized value so embedded quotes never break the
  // style attribute string (which is always wrapped in double quotes).
  const sharedTextStyles = [
    color ? `color: ${color};` : "",
    safeFontFamily ? `font-family: ${safeFontFamily};` : "",
    fontSize ? `font-size: ${fontSize};` : "",
    fontWeight ? `font-weight: ${fontWeight};` : "",
    fontStyle ? `font-style: ${fontStyle};` : "",
    lineHeight ? `line-height: ${lineHeight};` : "",
    letterSpacing ? `letter-spacing: ${letterSpacing};` : "",
    textTransform ? `text-transform: ${textTransform};` : "",
    textDecoration && textDecoration !== "none"
      ? `text-decoration: ${textDecoration};`
      : "",
    direction ? `direction: ${direction};` : "",
    opacity !== undefined ? `opacity: ${opacity};` : "",
    whiteSpace ? `white-space: ${whiteSpace};` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // Wrapper table for alignment - maintains proper positioning for hover indicators
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      {...rootBindingProps(bindings)}
      style={{
        width: "100%",
        borderCollapse: "collapse",
        boxSizing: "border-box",
        border: 0,
        margin: 0,
        padding: 0,
      }}
    >
      <tbody>
        <tr>
          <td
            align={align}
            style={{
              padding: 0,
            }}
          >
            {/* Inner button table - this is the actual button structure */}
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              style={{
                // --- Start dev
                position: "relative",
                // --- End dev

                width: width || "auto",
                ...(maxWidth && { maxWidth: maxWidth }),
                borderCollapse: "collapse",

                // base
                boxSizing: "border-box",
                border: 0,
                margin: 0,
                padding: 0,
              }}
              onClick={devMode ? (e) => e.preventDefault() : undefined}
            >
              <tbody>
                <tr>
                  <td
                    dangerouslySetInnerHTML={{
                      __html: `
      ${simpleOutlookButton}
      <!--[if !mso]><!-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tbody>
          <tr>
            <td style="${backgroundTdStyle.backgroundColor ? `background-color: ${backgroundTdStyle.backgroundColor};` : ""} ${backgroundTdStyle.borderRadius ? `border-radius: ${backgroundTdStyle.borderRadius};` : ""} width: ${backgroundTdStyle.width}; ${maxWidth ? `max-width: ${maxWidth};` : ""} ${borderRadius ? "overflow: hidden;" : ""}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; ${borderRadius ? `border-radius: ${borderRadius};` : ""} width: 100%; ${borderStyleString}">
                <tbody>
                  <tr>
                    <td style="padding: 0;">
                      ${
                        devMode
                          ? `<span style="${sharedTextStyles} ${textDecoration && textDecoration !== "none" ? "" : "text-decoration: none;"} display: block; ${wordBreak ? `word-break: ${wordBreak};` : ""} ${textAlign ? `text-align: ${textAlign};` : ""} ${padding ? `padding: ${padding};` : ""}">
                              ${typeof children === "string" ? children : ""}
                            </span>`
                          : href
                            ? `<a href="${href}" target="${target}" rel="noopener noreferrer" style="${sharedTextStyles} ${textDecoration && textDecoration !== "none" ? "" : "text-decoration: none;"} display: block; cursor: pointer; ${wordBreak ? `word-break: ${wordBreak};` : ""} ${textAlign ? `text-align: ${textAlign};` : ""} ${padding ? `padding: ${padding};` : ""}">
                                <span>
                                  ${typeof children === "string" ? children : ""}
                                </span>
                              </a>`
                            : `<span style="${sharedTextStyles} ${textDecoration && textDecoration !== "none" ? "" : "text-decoration: none;"} display: block; ${wordBreak ? `word-break: ${wordBreak};` : ""} ${textAlign ? `text-align: ${textAlign};` : ""} ${padding ? `padding: ${padding};` : ""}">
                                ${typeof children === "string" ? children : ""}
                              </span>`
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <!--<![endif]-->
    `,
                    }}
                  />
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Button, arePropsEqual);