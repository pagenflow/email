import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

export interface DividerConfig {
  /** Thickness of the line (e.g., "1px"). */
  height?: string;

  /** Color of the line. */
  color?: string;

  /** Width of the line (e.g., "100%" or "300px"). */
  width?: string;

  /** Spacing above and below the divider (e.g., "20px 0"). */
  margin?: string;

  /** Horizontal alignment of the divider. */
  align?: "left" | "center" | "right";
}

export type DividerProps = {
  config: DividerConfig;
  devNode?: ReactNode;
};

function Divider({ config, devNode }: DividerProps) {
  const {
    height = "1px",
    color = "#cccccc",
    width = "100%",
    margin = "20px 0",
    align = "center",
  } = config;

  // 1. Outer TD Style: Applies the vertical spacing (margin)
  const outerTdStyle: CSSProperties = {
    padding: margin,
    fontSize: "0",
    lineHeight: "0",
    width: "100%",
  };

  // 2. Divider Table Style: Applies the line properties
  const dividerTableStyle: CSSProperties = {
    width: width,
    height: height,
    backgroundColor: color,
    borderCollapse: "collapse",
    border: "0",

    // ✅ FIX 1: Use string literal indexing for MSO properties
    // ["mso-table-lspace" as string]: "0pt",
    ["msoTableLspace" as string]: "0pt",
    // ["mso-table-rspace" as string]: "0pt",
    ["msoTableRspace" as string]: "0pt",
  };

  // Parse height for the HTML attribute
  const dividerHeightAttribute = parseInt(height, 10) || 1;

  return (
    <table
      aria-label="Divider Wrapper"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        // --- Start dev
        position: "relative",
        // --- End dev

        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <tbody>
        <tr>
          {/* TD: Manages spacing (margin) and alignment */}
          <td style={outerTdStyle} align={align}>
            {/* Inner Table: This is the actual divider line */}
            <table
              aria-label="Divider Line"
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              align={align}
              style={dividerTableStyle}
              // ✅ FIX 2: Apply the HTML height attribute using type assertion
              {...({ height: dividerHeightAttribute } as any)}
            >
              <tbody>
                <tr>
                  {/* Empty TD that is forced to the line's height/color */}
                  <td
                    style={{
                      height: height,
                      fontSize: "0",
                      lineHeight: "0",
                      padding: "0",
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
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

export default memo(Divider, arePropsEqual);
