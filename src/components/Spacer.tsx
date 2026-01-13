import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

export interface SpacerConfig {
  /** The height of the vertical space (e.g., "20px"). Required. */
  height: string;
}

export type SpacerProps = {
  config: SpacerConfig;
  devNode?: ReactNode;
};

function Spacer({ config, devNode }: SpacerProps) {
  const { height } = config;

  // 1. Spacer Table Style
  const spacerTableStyle: CSSProperties = {
    // Crucial for compatibility: Ensures no background or border interference
    backgroundColor: "transparent",
    borderCollapse: "collapse",
    border: "0",
    width: "100%",

    // ✅ FIX: Use string literal indexing for MSO properties
    // Note the CSS standard dash convention: 'mso-table-lspace'
    // ["mso-table-lspace" as string]: "0pt",
    ["msoTableLspace" as string]: "0pt",
    // ["mso-table-rspace" as string]: "0pt",
    ["msoTableRspace" as string]: "0pt",
  };

  // 2. Spacer TD Style: The element that creates the actual vertical space
  const spacerTdStyle: CSSProperties = {
    height: height,
    // Critical: Suppress any vertical height created by text/font
    fontSize: "0",
    lineHeight: "0",
    padding: "0",
  };

  // Parse height for the HTML attribute
  const spacerHeightAttribute = parseInt(height, 10) || 1;

  return (
    // Outer table ensures the spacer spans the full width of its container
    <table
      aria-label="Vertical Spacer"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        // --- Start dev
        position: "relative",
        // --- End dev

        ...spacerTableStyle,
      }}
      // Explicit HTML height attribute is necessary for Outlook reliability
      {...({ height: spacerHeightAttribute } as any)}
    >
      <tbody>
        <tr>
          {/* TD: Manages the fixed height of the spacer */}
          <td
            style={spacerTdStyle}
            // Explicit height attribute
            height={spacerHeightAttribute}
          >
            {/* The non-breaking space ensures the TD renders even if completely empty */}
            &nbsp;
          </td>
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
