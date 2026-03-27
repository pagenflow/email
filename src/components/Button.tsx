import { CSSProperties, memo, ReactNode } from "react";
import { BorderConfig } from "../types";
import { arePropsEqual } from "../utils/memoUtils";

// Helper for alignment
type TdAlign = "center" | "left" | "right";

export interface ButtonConfig {
  /** The destination URL for the button. Required. */
  href: string;

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

function Button({ config, devMode }: ButtonProps) {
  const {
    href,
    children,
    backgroundColor = "#007bff", // Default blue
    color = "#ffffff",
    padding = "12px 24px",
    borderRadius = "3px",
    border,
    width,
    maxWidth,
    justifyContent = "center",
    textAlign = "center",
    fontSize = "16px",
    fontWeight = "500",
    fontStyle,
    fontFamily = "Arial, sans-serif",
    lineHeight = "1.2",
    letterSpacing,
    textTransform,
    textDecoration = "none",
    direction,
    verticalAlign,
    opacity,
    whiteSpace = "normal",
    wordBreak = "break-word",
  } = config;

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

  // --- Determine Button Approach Based on Width ---

  // Check if width is percentage-based or not defined
  const isPercentageWidth = !width || width.includes("%");
  const useSimpleOutlookApproach = isPercentageWidth;

  const align = justifyMap[justifyContent];

  // --- VML Calculation and Code for Outlook Compatibility (Fixed Width Only) ---
  let vmlButton = "";

  if (!useSimpleOutlookApproach) {
    // VML needs fixed pixel height. We estimate it based on padding and potential wrapping.
    const numericPadding = parseInt(padding.split(" ")[0] || "12", 10);
    const numericFontSize = parseInt(fontSize, 10);
    const numericLineHeight = lineHeight.includes("px")
      ? parseInt(lineHeight, 10)
      : numericFontSize * parseFloat(lineHeight);

    // Trust user's explicit pixel width - no calculation needed
    const vmlWidth = parseInt(width, 10);

    // Calculate VML height - trust user's padding and let text wrap naturally
    // VML v:textbox will handle text wrapping automatically
    const textContent = typeof children === "string" ? children : "";

    // Estimate number of lines based on text length and button width
    const horizontalPadding = padding.split(" ")[1]
      ? parseInt(padding.split(" ")[1], 10) * 2
      : numericPadding * 2;

    const availableTextWidth = vmlWidth - horizontalPadding;
    const charWidthMultiplier =
      fontWeight && parseInt(fontWeight) >= 500 ? 0.7 : 0.6;
    const avgCharWidth = numericFontSize * charWidthMultiplier;
    const charsPerLine = Math.max(
      Math.floor(availableTextWidth / avgCharWidth),
      1,
    );
    const numberOfLines = Math.max(
      Math.ceil(textContent.length / charsPerLine),
      1,
    );

    // Calculate height: vertical padding + (lines * line height) + extra buffer for VML
    const textHeight = numberOfLines * numericLineHeight;
    // Add extra 4px buffer to prevent bottom cropping in VML
    const vmlHeight = Math.max(numericPadding * 2 + textHeight + 4, 40);

    // VML colors must use the full hex format (e.g., #000000)
    const vmlFillColor = backgroundColor.startsWith("#")
      ? backgroundColor
      : `#${backgroundColor}`;

    // VML stroke color for border
    const vmlStrokeColor = border?.color || vmlFillColor;
    const vmlStrokeWeight = border?.width ? parseInt(border.width, 10) : 0;
    const hasVmlStroke = vmlStrokeWeight > 0;

    // Build VML font styles - consistent with other rendering paths
    const vmlFontWeight = fontWeight || "500";
    const vmlFontStyle = fontStyle === "italic" ? "font-style:italic;" : "";
    const vmlLetterSpacing = letterSpacing
      ? `letter-spacing:${letterSpacing};`
      : "";
    const vmlTextTransform = textTransform
      ? `text-transform:${textTransform};`
      : "";
    const vmlTextDecoration =
      textDecoration && textDecoration !== "none"
        ? `text-decoration:${textDecoration};`
        : "";
    const vmlWhiteSpace =
      whiteSpace !== "normal" ? `white-space:${whiteSpace};` : "";
    const vmlDirection = direction ? `direction:${direction};` : "";
    const vmlOpacity = opacity !== undefined ? `opacity:${opacity};` : "";

    // VML code uses MSO conditional comments to render only in Outlook
    // Use table with explicit MSO height for vertical centering
    const horizontalPaddingValue = padding.split(" ")[1]
      ? parseInt(padding.split(" ")[1], 10)
      : numericPadding;

    // For VML, we need to use a table inside to properly apply padding and centering
    let vmlAlignAttr = "";
    let vmlAlignStyle = "";
    if (textAlign === "center") {
      vmlAlignAttr = 'align="center"';
    } else {
      vmlAlignStyle = `text-align:${textAlign};`;
    }

    // Border radius is intentionally omitted (arcsize="0%") for Outlook Classic.
    // Outlook Classic does not reliably support rounded corners and the result
    // is inconsistent, so we render sharp corners there instead.
    vmlButton = `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${vmlHeight}px;width:${vmlWidth}px;" arcsize="0%" strokecolor="${vmlStrokeColor}" ${hasVmlStroke ? `strokeweight="${vmlStrokeWeight}px"` : 'stroke="f"'} fillcolor="${vmlFillColor}">
      <w:anchorlock/>
      <v:textbox inset="${horizontalPaddingValue}px,${numericPadding}px,${horizontalPaddingValue}px,${numericPadding}px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
          <tr>
            <td ${vmlAlignAttr} valign="middle" style="${vmlAlignStyle}color:${color};font-family:${safeFontFamily};font-size:${fontSize};font-weight:${vmlFontWeight};${vmlFontStyle}${vmlLetterSpacing}${vmlTextTransform}${vmlTextDecoration}${vmlWhiteSpace}${vmlDirection}${vmlOpacity}line-height:${lineHeight};mso-line-height-rule:exactly;">
              ${typeof children === "string" ? children : ""}
            </td>
          </tr>
        </table>
      </v:textbox>
    </v:roundrect>
    <![endif]-->
  `;
  }

  // --- Simple Outlook Approach for Percentage Widths ---
  let simpleOutlookButton = "";

  if (useSimpleOutlookApproach) {
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
    const whiteSpaceProp =
      whiteSpace !== "normal" ? `white-space: ${whiteSpace};` : "";
    const directionProp = direction ? `direction: ${direction};` : "";
    const opacityProp = opacity !== undefined ? `opacity: ${opacity};` : "";
    const wordBreakProp =
      wordBreak !== "break-word" ? `word-break: ${wordBreak};` : "";

    // Border radius is intentionally omitted from the Outlook Classic table cell.
    // Outlook Classic ignores border-radius on table cells anyway, and including it
    // can cause unexpected rendering artifacts, so we explicitly leave it out.
    simpleOutlookButton = `
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
      <tr>
        <td align="${align}" style="padding: 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width || "auto"}" style="border-collapse: collapse;">
            <tr>
              <td bgcolor="${backgroundColor}" align="${textAlign}" style="padding: ${padding}; text-align: ${textAlign}; ${borderStyleString}">
                <a href="${href}" target="_blank" rel="noopener noreferrer" style="color: ${color}; ${textDecorationStyle} display: block; font-family: ${safeFontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; ${fontStyleProp} line-height: ${lineHeight}; ${letterSpacingProp} ${textTransformProp} text-align: ${textAlign}; ${whiteSpaceProp} ${directionProp} ${opacityProp} ${wordBreakProp} mso-line-height-rule: exactly;">
                  ${typeof children === "string" ? children : ""}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <![endif]-->
  `;
  }

  // Build shared inline style fragments for the non-MSO path.
  // fontFamily uses the sanitized value so embedded quotes never break the
  // style attribute string (which is always wrapped in double quotes).
  const sharedTextStyles = [
    `color: ${color};`,
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
    whiteSpace !== "normal" ? `white-space: ${whiteSpace};` : "",
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
      ${useSimpleOutlookApproach ? simpleOutlookButton : vmlButton}
      <!--[if !mso]><!-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tbody>
          <tr>
            <td style="background-color: ${backgroundTdStyle.backgroundColor}; border-radius: ${backgroundTdStyle.borderRadius}; width: ${backgroundTdStyle.width}; ${maxWidth ? `max-width: ${maxWidth};` : ""} ${borderRadius ? "overflow: hidden;" : ""}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; border-radius: ${borderRadius}; width: 100%; ${borderStyleString}">
                <tbody>
                  <tr>
                    <td style="padding: 0;">
                      ${
                        devMode
                          ? `<span style="${sharedTextStyles} ${textDecoration && textDecoration !== "none" ? "" : "text-decoration: none;"} display: block; word-break: ${wordBreak}; text-align: ${textAlign}; padding: ${padding};">
                              ${typeof children === "string" ? children : ""}
                            </span>`
                          : `<a href="${href}" target="_blank" rel="noopener noreferrer" style="${sharedTextStyles} ${textDecoration && textDecoration !== "none" ? "" : "text-decoration: none;"} display: block; word-break: ${wordBreak}; text-align: ${textAlign}; padding: ${padding};">
                              <span>
                                ${typeof children === "string" ? children : ""}
                              </span>
                            </a>`
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