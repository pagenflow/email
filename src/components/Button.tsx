import { createElement, CSSProperties, memo, ReactNode } from "react";
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
  } = config;

  // 1. Link (A) Tag Styles (Fallback for Webmail/Mobile)
  const linkStyle: CSSProperties = {
    color: color,
    textDecoration: "none",
    display: "block",
    // Apply padding here for simplicity, though the TD is more reliable
    padding: padding,
    wordBreak: "break-word",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    fontWeight: "bold",
    lineHeight: "1.2",
  };

  // 2. Button Wrapper TD Style
  const buttonTdStyle: CSSProperties = {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    padding: "0",
    width: width || "auto",
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

  // VML code uses MSO conditional comments to render only in Outlook
  const vmlButton = `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${vmlHeight}px;v-text-anchor:middle;width:${vmlWidth}px;" arcsize="${(parseInt(borderRadius) / vmlHeight) * 100}%" strokecolor="${vmlFillColor}" fillcolor="${vmlFillColor}">
      <w:anchorlock/>
      <center style="color:${color};font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">
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
        border: "0 solid",
        margin: 0,
        padding: 0,
      }}
    >
      <tbody>
        <tr>
          <td>
            {/* 1. VML Button (For Outlook) */}
            {/* Using dangerouslySetInnerHTML is a necessary evil for VML */}
            <div dangerouslySetInnerHTML={{ __html: vmlButton }} />

            {/* 2. Standard HTML Button (For all other clients) */}
            {/*[if !mso]><!*/}
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              style={{
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <tbody>
                <tr>
                  <td style={buttonTdStyle}>
                    {/* <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                    >
                      {children}
                    </a> */}
                    {createElement(
                      devMode ? "button" : "a",
                      {
                        ...(devMode
                          ? {}
                          : {
                              href,
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }),
                        style: linkStyle,
                        draggable: false,
                      },
                      children,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            {/*<![endif]*/}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Button, arePropsEqual);
