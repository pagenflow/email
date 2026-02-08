import { CSSProperties, memo, ReactNode } from "react";
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

  /** Width of the button (e.g., "200px" or "100%"). */
  width?: string;

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

  /** Line height (e.g., '1.5' or '24px'). */
  lineHeight?: string;

  /** Letter spacing (e.g., '0.5px', '1px'). */
  letterSpacing?: string;

  /** Text transform (e.g., 'uppercase', 'lowercase', 'capitalize'). */
  textTransform?: string;

  /** Text decoration (e.g., 'underline', 'line-through'). */
  textDecoration?: string;

  /** Font family (e.g., 'Arial, sans-serif'). */
  fontFamily?: string;

  /** White space behavior (e.g., 'normal', 'nowrap', 'pre-wrap'). */
  whiteSpace?: string;
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

function Button({ config, devMode }: ButtonProps) {
  const {
    href,
    children,
    backgroundColor = "#007bff", // Default blue
    color = "#ffffff",
    padding = "12px 24px",
    borderRadius = "3px",
    width,
    justifyContent = "center",
    textAlign = "center",
    fontSize = "16px",
    fontWeight = "500",
    fontStyle,
    lineHeight = "1.2",
    letterSpacing,
    textTransform,
    textDecoration = "none",
    fontFamily = "Arial, sans-serif",
    whiteSpace = "normal",
  } = config;

  // 1. Link (A) Tag Styles (Fallback for Webmail/Mobile)
  const linkStyle: CSSProperties = {
    color: color,
    textDecoration: textDecoration,
    display: "block",
    // Apply padding here for simplicity, though the TD is more reliable
    padding: padding,
    wordBreak: "break-word",
    fontFamily: fontFamily,
    fontSize: fontSize,
    fontWeight: fontWeight,
    fontStyle: fontStyle,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    textTransform: textTransform as any,
    textAlign: textAlign,
    whiteSpace: whiteSpace as any,
  };

  // 2. Outer TD Style for Background and Border Radius (no border)
  const backgroundTdStyle: CSSProperties = {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    width: width || "auto",
    // Overflow hidden to clip background to border-radius
    ...(borderRadius && { overflow: "hidden" }),
  };

  // --- VML Calculation and Code for Outlook Compatibility ---

  // VML needs fixed pixel height. We estimate it based on padding.
  const numericPadding = parseInt(padding.split(" ")[0] || "12", 10);
  const vmlHeight = numericPadding * 2 + 20; // Estimate height based on padding + font size
  const vmlWidth = width ? parseInt(width, 10) : 200; // Default VML width (fixed)

  // VML colors must use the full hex format (e.g., #000000)
  const vmlFillColor = backgroundColor.startsWith("#")
    ? backgroundColor
    : `#${backgroundColor}`;

  const align = justifyMap[justifyContent];

  // Build VML font styles
  const vmlFontWeight = fontWeight || "bold";
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
    whiteSpace && whiteSpace !== "normal" ? `white-space:${whiteSpace};` : "";

  // VML code uses MSO conditional comments to render only in Outlook
  const vmlButton = `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${vmlHeight}px;v-text-anchor:middle;width:${vmlWidth}px;" arcsize="${(parseInt(borderRadius) / vmlHeight) * 100}%" strokecolor="${vmlFillColor}" fillcolor="${vmlFillColor}">
      <w:anchorlock/>
      <center style="color:${color};font-family:${fontFamily};font-size:${fontSize};font-weight:${vmlFontWeight};${vmlFontStyle}${vmlLetterSpacing}${vmlTextTransform}${vmlTextDecoration}${vmlWhiteSpace}">
        ${typeof children === "string" ? children : ""}
      </center>
    </v:roundrect>
    <![endif]-->
  `;

  return (
    // Outer table for alignment (center the button horizontally)
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      align={align} // This centers the table (and thus the button)
      style={{
        // --- Start dev
        position: "relative",
        // --- End dev

        width: width || "auto",
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
      ${devMode ? "" : vmlButton}
      <!--[if !mso]><!-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
        <tbody>
          <tr>
            <td style="background-color: ${backgroundTdStyle.backgroundColor}; border-radius: ${backgroundTdStyle.borderRadius}; width: ${backgroundTdStyle.width}; ${borderRadius ? "overflow: hidden;" : ""}">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; border-radius: ${borderRadius}; width: 100%;">
                <tbody>
                  <tr>
                    <td style="padding: ${padding};">
                      ${
                        devMode
                          ? `<span style="color: ${color}; font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle || "normal"}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing || "normal"}; text-transform: ${textTransform || "none"}; text-decoration: ${textDecoration}; white-space: ${whiteSpace}; display: ${linkStyle.display}; text-align: ${textAlign}; word-break: ${linkStyle.wordBreak};">
                              ${typeof children === "string" ? children : ""}
                            </span>`
                          : `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: ${color}; text-decoration: ${textDecoration}; display: ${linkStyle.display}; word-break: ${linkStyle.wordBreak}; font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle || "normal"}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing || "normal"}; text-transform: ${textTransform || "none"}; text-align: ${textAlign}; white-space: ${whiteSpace};">
                              <span style="color: ${color}; font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; font-style: ${fontStyle || "normal"}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing || "normal"}; text-transform: ${textTransform || "none"}; text-decoration: ${textDecoration}; white-space: ${whiteSpace};">
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
  );
}

export default memo(Button, arePropsEqual);
