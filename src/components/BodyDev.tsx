import { ReactNode, CSSProperties } from "react";
import { GlobalConfig } from "./Body";

export interface BodyDevProps {
  children: ReactNode;
  /** Global configuration from GlobalEditor */
  config?: GlobalConfig;
}

export default function BodyDev({ children, config = {} }: BodyDevProps) {
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

  // Main container style (simulates body behavior in dev mode)
  const bodyDevStyle: CSSProperties = {
    backgroundColor: globalBackgroundColor,
    color: globalColor,
    fontSize: globalFontSize,
    lineHeight: globalLineHeight,
    padding: "0",
    margin: "0",
    fontFamily: "Arial, Helvetica, sans-serif",
    overflowX: "hidden",

    // Background image support (if provided)
    ...(bgImage && {
      backgroundImage: `url(${bgImage})`,
      backgroundRepeat: bgRepeat,
      backgroundSize: bgSize,
      backgroundPosition: bgPosition,
    }),
  };

  //   // Center wrapper style
  //   const centerStyle: CSSProperties = {
  //     width: '100%',
  //     minHeight: '100vh',
  //     display: 'flex',
  //     justifyContent: 'center',
  //     alignItems: 'flex-start',
  //     background: globalBackgroundColor,
  //     ...(bgImage && {
  //       backgroundImage: `url(${bgImage})`,
  //       backgroundRepeat: bgRepeat,
  //       backgroundSize: bgSize,
  //       backgroundPosition: bgPosition,
  //     }),
  //   };

  //   // Table wrapper style
  //   const tableWrapperStyle: CSSProperties = {
  //     width: '100%',
  //     maxWidth: '100%',
  //   };

  return (
    <div
      className="builder-canvas body-dev"
      style={{
        ...bodyDevStyle,
        containerName: "builder-canvas",
        containerType: "inline-size",
      }}
    >
      {children}
    </div>
  );
}
