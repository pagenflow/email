import { ReactNode, CSSProperties } from "react";

export interface GlobalConfig {
  color?: string;
  fontSize?: string;
  backgroundColor?: string;
  lineHeight?: string;
  fontFamily?: string;
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
  const globalColor = config.color || "";
  const globalFontSize = config.fontSize || "";
  const globalBackgroundColor = config.backgroundColor || "";
  const globalLineHeight = config.lineHeight || "";
  const globalFontFamily = config.fontFamily || "";

  // Background image properties
  const bgImage = config.backgroundImage?.src || "";
  const bgRepeat = config.backgroundImage?.repeat || "";
  const bgSize = config.backgroundImage?.size || "";
  const bgPosition = config.backgroundImage?.position || "";

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

    ["msTextSizeAdjust" as string]: "100%",
    ["msoLineHeightRule" as string]: "exactly",

    fontFamily: globalFontFamily,

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
    ["msoLineHeightRule" as string]: "exactly",
    borderCollapse: "collapse",
  };

  return (
    <body style={bodyStyle}>
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
        <table
          role="presentation"
          border={0 as any}
          cellPadding={0}
          cellSpacing={0}
          align="center"
          width="100%"
          style={outerTableStyle}
        >
          <tbody>
            <tr>
              <td align="center" style={{ padding: "0", margin: "0" }}>
                {children}
              </td>
            </tr>
          </tbody>
        </table>
      </center>

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
