import { ReactNode, CSSProperties } from "react";

export interface GlobalConfig {
  color?: string;
  fontSize?: string;
  backgroundColor?: string;
  lineHeight?: string;
  backgroundImage?: {
    src?: string;
    repeat?: string;
    size?: string;
    position?: string;
  };
}

export interface BodyProps {
  children: ReactNode;
  /** Global configuration from GlobalEditor */
  config?: GlobalConfig;
}

export default function Body({ children, config = {} }: BodyProps) {
  // Extract config values with fallbacks
  const globalColor = config.color || "#000000";
  const globalFontSize = config.fontSize || "16px";
  const globalBackgroundColor = config.backgroundColor || "#ffffff";
  const globalLineHeight = config.lineHeight || "1.4";

  // Background image properties
  const bgImage = config.backgroundImage?.src || "";
  const bgRepeat = config.backgroundImage?.repeat || "no-repeat";
  const bgSize = config.backgroundImage?.size || "cover";
  const bgPosition = config.backgroundImage?.position || "center";

  // 1. Style for the <body> tag inline
  const bodyStyle: CSSProperties = {
    backgroundColor: globalBackgroundColor,
    color: globalColor,
    fontSize: globalFontSize,
    lineHeight: globalLineHeight,
    padding: "0",
    margin: "0",
    WebkitTextSizeAdjust: "100%",
    overflowX: "hidden",

    // ✅ FIX 1: Use string indexing for MSO property
    // ['ms-text-size-adjust' as string]: '100%',
    ["msTextSizeAdjust" as string]: "100%",
    // ["mso-line-height-rule" as string]: "exactly",
    ["msoLineHeightRule" as string]: "exactly",

    // Base font for body
    fontFamily: "Arial, Helvetica, sans-serif",

    // Background image support (if provided)
    ...(bgImage && {
      backgroundImage: `url(${bgImage})`,
      backgroundRepeat: bgRepeat,
      backgroundSize: bgSize,
      backgroundPosition: bgPosition,
    }),
  };

  // 2. Style for the top-level <table> wrapper
  const outerTableStyle: CSSProperties = {
    width: "100%",

    // ✅ FIX 1 (on table): Use string indexing for MSO property
    ["msoLineHeightRule" as string]: "exactly",
    // ['mso-line-height-rule' as string]: 'exactly',

    borderCollapse: "collapse",
  };

  return (
    // The <body> tag with inline styles
    <body style={bodyStyle}>
      {/* Center tag is a legacy but reliable way to center content in some clients */}
      <center
        style={{
          width: "100%",
          background: globalBackgroundColor,
          ...(bgImage && {
            backgroundImage: `url(${bgImage})`,
            backgroundRepeat: bgRepeat,
            backgroundSize: bgSize,
            backgroundPosition: bgPosition,
          }),
        }}
      >
        {/* Top-level table for background, centering, and wrapping content */}
        <table
          role="presentation"
          border={0 as any} // 🔒 Use number attribute and type assertion for border
          cellPadding={0}
          cellSpacing={0}
          align="center"
          width="100%"
          style={outerTableStyle} // Use the type-safe style object
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "0", margin: "0" }}>
                {/* All email content (Sections, Containers, etc.) goes here */}
                {children}
              </td>
            </tr>
          </tbody>
        </table>
      </center>

      {/* MSO fix for bottom scrollbar */}
      <div
        style={{
          display: "none",
          whiteSpace: "nowrap",
          font: "15px courier",
          lineHeight: "0",
        }}
      >
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      </div>
    </body>
  );
}
