import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import { DataBindings } from "../types/DataBindings";
import { rootBindingProps } from "./utils/bindingAttribute";
import { BackgroundImageType } from "./Row";

export interface SpacerConfig {
  /** The height of the vertical space (e.g., "20px"). Required. */
  height: string;
  hideOnMobile?: boolean;
  backgroundColor?: string;
  backgroundImage?: BackgroundImageType;
}

export type SpacerProps = {
  config: SpacerConfig;
  devNode?: ReactNode;
  bindings?: DataBindings;
};

function Spacer({ config, devNode, bindings }: SpacerProps) {
  const { height, hideOnMobile, backgroundColor, backgroundImage } = config;

  // 1. Spacer Table Style
  const spacerTableStyle: CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
  };

  // 2. Spacer TD Style: The element that creates the actual vertical space
  const spacerTdStyle: CSSProperties = {
    height: height,
    maxHeight: height,
    fontSize: "0",
    lineHeight: "0",
    padding: "0",
    margin: "0",
    border: "none",
    color: "transparent",
    // Background applied at TD level for Outlook Classic compatibility
    ...(backgroundColor && { backgroundColor }),
    ...(backgroundImage && {
      backgroundImage: `url(${backgroundImage.src})`,
      backgroundRepeat: backgroundImage.repeat ?? "no-repeat",
      backgroundSize: backgroundImage.size ?? "cover",
      backgroundPosition: backgroundImage.position ?? "center",
    }),
  };

  // Parse height for the HTML attribute
  const spacerHeightAttribute = parseInt(height, 10) || 1;

  return (
    <table
      aria-label="Vertical Spacer"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      {...rootBindingProps(bindings)}
      style={{
        // --- Start dev
        position: "relative",
        // --- End dev

        ...spacerTableStyle,
      }}
      // Explicit HTML height attribute is necessary for Outlook reliability
      {...({ height: spacerHeightAttribute } as any)}
      className={hideOnMobile ? "hide-on-mobile" : undefined}
    >
      <tbody>
        <tr>
          {/* TD: Manages the fixed height of the spacer */}
          <td
            style={spacerTdStyle}
            height={spacerHeightAttribute}
            // bgcolor is the Outlook-Classic-safe fallback for solid background
            // colours — it survives both the VML renderer and Word's HTML parser
            // which strips CSS background-color from table cells in some builds.
            {...(backgroundColor && !backgroundImage
              ? { bgcolor: backgroundColor }
              : {})}
          />
        </tr>
      </tbody>
      {devNode && (
        <tfoot>
          <tr>
            <td>{devNode}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

export default memo(Spacer, arePropsEqual);
