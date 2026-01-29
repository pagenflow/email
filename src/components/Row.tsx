import { Fragment, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import {
  AlignItems,
  BorderConfig,
  JustifyContent,
  TdAlign,
  TdValign,
} from "../types";

const justifyMap: Record<JustifyContent, TdAlign> = {
  start: "left",
  center: "center",
  end: "right",
};
const alignMap: Record<AlignItems, TdValign> = {
  start: "top",
  center: "middle",
  end: "bottom",
};

export interface RowConfig {
  gap?: string; // Now supports both horizontal gap between children AND vertical gap for nested rows
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  width?: string;
  height?: string;

  // Styling props
  padding?: string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: BorderConfig;
}

export type RowProps = {
  children: ReactNode;
  config: RowConfig;
  devNode?: ReactNode;
};

function getBorderStyle(border?: BorderConfig): React.CSSProperties {
  if (!border) return {};

  const style: React.CSSProperties = {};

  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
  }

  if (border.top) {
    style.borderTop = `${border.top.width} ${border.top.style} ${border.top.color}`;
  }
  if (border.right) {
    style.borderRight = `${border.right.width} ${border.right.style} ${border.right.color}`;
  }
  if (border.bottom) {
    style.borderBottom = `${border.bottom.width} ${border.bottom.style} ${border.bottom.color}`;
  }
  if (border.left) {
    style.borderLeft = `${border.left.width} ${border.left.style} ${border.left.color}`;
  }

  return style;
}

function Row({ children, config, devNode }: RowProps) {
  const childrenArray = (
    Array.isArray(children) ? children : [children]
  ).filter((child) => child != null) as ReactNode[];

  const numChildren = childrenArray.length;

  // 1. Outer TD for Background and Border Radius (no border here)
  const backgroundTdStyle: React.CSSProperties = {
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,
    width: config.width || "100%",
    height: config.height,

    // Overflow hidden to clip background to border-radius
    ...(config.borderRadius && { overflow: "hidden" }),
  };

  // 2. Inner Table for Border and Border Radius
  const borderTableStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderCollapse: "separate", // Changed from collapse to separate for border-radius
    borderSpacing: 0,
    borderRadius: config.borderRadius,
    ...getBorderStyle(config.border),
  };

  // 3. TD for Padding
  const paddingTdStyle: React.CSSProperties = {
    padding: config.padding,
    width: "100%",
    height: "100%",
    verticalAlign: "top",
  };

  // 4. Content Table - horizontal layout
  const contentTableStyle: React.CSSProperties = {
    width: "auto",
    height: "100%",
    borderCollapse: "collapse",
    minWidth: "1px",
    maxWidth: config.width || "100%",
  };

  // 5. Gap styles for horizontal spacing between children
  const gapTdStyle: React.CSSProperties = {
    width: config.gap || "0",
    lineHeight: "1px",
    fontSize: "1px",
  };

  const tdAlign = config.justifyContent
    ? justifyMap[config.justifyContent]
    : "left";
  const tdValign = config.alignItems ? alignMap[config.alignItems] : "top";

  return (
    <table
      aria-label="Row Outer"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        position: "relative",
        width: config.width || "100%",
        height: config.height,
        borderCollapse: "collapse",
      }}
      {...(config.height && { height: config.height })}
    >
      <tbody>
        <tr>
          {/* Outer TD: Background, Border Radius, Width, Height */}
          <td
            style={backgroundTdStyle}
            {...(config.height && { height: config.height })}
          >
            {/* Inner Table: Border and Border Radius */}
            <table
              aria-label="Row Border Wrapper"
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              style={borderTableStyle}
            >
              <tbody>
                <tr>
                  {/* Padding TD */}
                  <td style={paddingTdStyle}>
                    <table
                      aria-label="Row Justification Wrapper"
                      role="presentation"
                      cellPadding={0}
                      cellSpacing={0}
                      border={0}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td align={tdAlign}>
                            <table
                              aria-label="Row Content"
                              role="presentation"
                              cellPadding={0}
                              cellSpacing={0}
                              border={0}
                              style={contentTableStyle}
                              {...(config.height && { height: config.height })}
                            >
                              <tbody>
                                <tr>
                                  {/* Horizontal layout with gap support */}
                                  {childrenArray.map((child, index) => (
                                    <Fragment key={`row-child-${index}`}>
                                      <td
                                        valign={tdValign}
                                        style={{
                                          verticalAlign: tdValign,
                                          textAlign: "left",
                                          padding: "0",
                                          margin: "0",
                                        }}
                                      >
                                        {child}
                                      </td>

                                      {/* Add horizontal gap between children (not after last child) */}
                                      {index < numChildren - 1 &&
                                        config.gap && (
                                          <td
                                            key={`row-gap-${index}`}
                                            width={config.gap}
                                            style={gapTdStyle}
                                          >
                                            &nbsp;
                                          </td>
                                        )}
                                    </Fragment>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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

export default memo(Row, arePropsEqual);
