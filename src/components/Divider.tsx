import { memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

export interface DividerConfig {
  height?: string;
  color?: string;
  width?: string;
  margin?: string;
  align?: "left" | "center" | "right";
  hideOnMobile?: boolean;
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
    hideOnMobile,
  } = config;

  const heightPx = parseInt(height, 10) || 1;

  // Parse margin into paddingTop / paddingBottom for the outer TD.
  // Outlook ignores shorthand "20px 0" on TDs — must be explicit.
  const [marginTopRaw = "0", marginRightRaw = "0", marginBottomRaw, marginLeftRaw] =
    margin.trim().split(/\s+/);
  const marginTop = marginTopRaw;
  const marginBottom = marginBottomRaw ?? marginTopRaw; // "20px 0" → top=20px, bottom=20px
  void marginRightRaw;
  void marginLeftRaw;

  // Outlook requires align on the outer TD to correctly position
  // a fixed-width inner table (e.g. width="300px").
  const alignAttr = align === "left" ? "left" : align === "right" ? "right" : "center";

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        position: "relative", // dev overlay anchor
        width: "100%",
        borderCollapse: "collapse",
        border: "0",
      }}
      className={hideOnMobile ? "hide-on-mobile" : undefined}
    >
      <tbody>
        <tr>
          {/*
            Outer TD:
            - Uses explicit padding-top / padding-bottom instead of shorthand
              because Outlook/Word partially ignores padding shorthand on TDs.
            - align attribute (not just CSS text-align) drives centering of
              the inner table in Outlook.
          */}
          <td
            align={alignAttr}
            style={{
              paddingTop: marginTop,
              paddingBottom: marginBottom,
              paddingLeft: "0",
              paddingRight: "0",
              fontSize: "0",
              lineHeight: "0",
            }}
          >
            {/*
              Inner wrapper table:
              - width / align here position the line block itself.
              - NO background-color here — Outlook ignores it on <table>.
              - border="0" as HTML attribute AND style — belt + braces for Outlook.
            */}
            <table
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              align={alignAttr}
              style={{
                width: width,
                borderCollapse: "collapse",
                border: "0",
              }}
            >
              <tbody>
                <tr>
                  {/*
                    The actual divider line lives entirely on this TD:

                    1. height="N" HTML attribute  → Outlook uses this, not CSS height.
                    2. background-color on TD      → only place Outlook respects it.
                    3. mso-line-height-rule:exactly → prevents Word inflating the row.
                    4. line-height === height      → collapses the row in all clients.
                    5. font-size: 0               → kills any phantom text gap.
                    6. Empty content              → &nbsp; adds ~1em phantom height in Outlook.

                    MSO props cannot go through React's style object (it strips them),
                    so we use a ref to write the raw style attribute after mount,
                    and also set it as a static string via dangerouslySetInnerHTML
                    on a child so it survives SSR / static rendering.
                  */}
                  <td
                    {...({ height: heightPx } as Record<string, unknown>)}
                    ref={(el) => {
                      if (!el) return;
                      el.setAttribute(
                        "style",
                        `height:${height};` +
                          `line-height:${height};` +
                          `font-size:0;` +
                          `padding:0;` +
                          `background-color:${color};` +
                          `mso-line-height-rule:exactly;`
                      );
                    }}
                    style={{
                      // Fallback for non-Outlook clients (React-rendered style object).
                      height: height,
                      lineHeight: height,
                      fontSize: "0",
                      padding: "0",
                      backgroundColor: color,
                    }}
                  />
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