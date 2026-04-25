import { ReactNode, CSSProperties } from "react";
import { GlobalConfig } from "./Body";

export interface BodyDevProps {
  children: ReactNode;
  /** Global configuration from GlobalEditor */
  config?: GlobalConfig;
}

export default function BodyDev({ children, config = {} }: BodyDevProps) {
  // Extract config values with fallbacks
  const globalColor = config.color || "";
  const globalFontSize = config.fontSize || "";
  const globalBackgroundColor = config.backgroundColor || "";
  const globalLineHeight = config.lineHeight || "";

  // Background image properties
  const bgImage = config.backgroundImage?.src || "";
  const bgRepeat = config.backgroundImage?.repeat || "";
  const bgSize = config.backgroundImage?.size || "";
  const bgPosition = config.backgroundImage?.position || "";

  // Main container style (simulates body behavior in dev mode)
  const bodyDevStyle: CSSProperties = {
    backgroundColor: globalBackgroundColor,
    color: globalColor,
    fontSize: globalFontSize,
    lineHeight: globalLineHeight,
    padding: "0",
    margin: "0",
    fontFamily: config.fontFamily,
    overflowX: "hidden",

    // Background image support (if provided)
    ...(bgImage && {
      backgroundImage: `url(${bgImage})`,
      backgroundRepeat: bgRepeat,
      backgroundSize: bgSize,
      backgroundPosition: bgPosition,
    }),
  };

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
