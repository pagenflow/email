import { Fragment, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

export interface BackgroundImageType {
  src: string;
  repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  size?: "auto" | "cover" | "contain";
  position?: string;
}

// Border configuration supporting multiple borders via nested tables
export interface BorderConfig {
  width?: string;
  style?: "solid" | "dashed" | "dotted" | "double";
  color?: string;
  // Support individual sides
  top?: { width: string; style: string; color: string };
  right?: { width: string; style: string; color: string };
  bottom?: { width: string; style: string; color: string };
  left?: { width: string; style: string; color: string };
}

export type ColumnConfig = {
  // Border and Padding
  borderRadius?: string;
  padding?: string;
  border?: BorderConfig;

  // Alignment (maps to vertical-align)
  alignItems?: "start" | "center" | "end";
  justifyContent?: "start" | "center" | "end";

  // background
  backgroundColor?: string;
  backgroundImage?: BackgroundImageType;

  // Width/Dimension
  width?: string;
  height?: string;

  // NEW: Gap property for spacing between children
  gap?: string;
};

export type ColumnProps = {
  children: ReactNode;
  config: ColumnConfig;
  devNode?: ReactNode;
};

// Define the exact set of acceptable values for the 'valign' attribute
type TdValign = "top" | "middle" | "bottom";

// Define the exact set of acceptable values for the 'align' attribute
type Tdalign = "left" | "center" | "right";

// Helper for vertical alignment
const vAlignMap: Record<
  NonNullable<ColumnConfig["justifyContent"]>,
  TdValign
> = {
  start: "top",
  center: "middle",
  end: "bottom",
};

// Helper for horizontal alignment
const alignMap: Record<NonNullable<ColumnConfig["alignItems"]>, Tdalign> = {
  start: "left",
  center: "center",
  end: "right",
};

// Helper to convert border config to CSS border shorthand
function getBorderStyle(border?: BorderConfig): React.CSSProperties {
  if (!border) return {};

  const style: React.CSSProperties = {};

  // Check for unified border
  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
  }

  // Individual sides override unified border
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

function Column({ children, config, devNode }: ColumnProps) {
  // Process children array for gap support
  const childrenArray = (
    Array.isArray(children) ? children : [children]
  ).filter((child) => child != null) as ReactNode[];
  const numChildren = childrenArray.length;

  // 1. Outer table style: Takes up the full width/height of its parent TD
  const outerTableStyle: React.CSSProperties = {
    width: "100%",
    height: config.height,
    borderCollapse: "collapse",
  };

  // 2. Outer TD style: Background, Border Radius, and Border
  const outerTdStyle: React.CSSProperties = {
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,

    // Apply border styles
    ...getBorderStyle(config.border),

    // Background Image styles
    backgroundImage: config.backgroundImage
      ? `url(${config.backgroundImage.src})`
      : undefined,
    backgroundRepeat: config.backgroundImage?.repeat,
    backgroundSize: config.backgroundImage?.size,
    backgroundPosition: config.backgroundImage?.position,
  };

  // 3. Inner TD style: Padding and Vertical Alignment
  const innerTdStyle: React.CSSProperties = {
    padding: config.padding,
    height: config.height,
    verticalAlign: config.alignItems ? alignMap[config.alignItems] : "top",
  };

  // 4. Gap spacer style (used between children)
  const gapSpacerStyle: React.CSSProperties = {
    height: config.gap || "0",
    lineHeight: "1px",
    fontSize: "1px",
    width: "100%",
  };

  return (
    <table
      aria-label="Column Wrapper"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        position: "relative",
        ...outerTableStyle,
      }}
      {...(config.height && { height: config.height })}
    >
      <tbody>
        <tr>
          {/* Outer TD: Background, Border, Border Radius, Width, Height */}
          <td
            style={outerTdStyle}
            {...(config.width && { width: config.width })}
            {...(config.height && { height: config.height })}
          >
            {/* Inner Table: Used to cleanly separate background/border from padding */}
            <table
              aria-label="Column Padding"
              role="presentation"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              style={{
                width: "100%",
                height: config.height,
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                <tr>
                  {/* Inner TD: Padding and Vertical Alignment */}
                  <td
                    style={innerTdStyle}
                    valign={
                      config.justifyContent
                        ? vAlignMap[config.justifyContent]
                        : "top"
                    }
                    align={
                      config.alignItems ? alignMap[config.alignItems] : "left"
                    }
                    {...(config.height && { height: config.height })}
                  >
                    {/* Content wrapper for gap support */}
                    {config.gap && numChildren > 1 ? (
                      <table
                        aria-label="Column Gap Wrapper"
                        role="presentation"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                        }}
                      >
                        <tbody>
                          {childrenArray.map((child, index) => (
                            <Fragment key={`col-child-${index}`}>
                              <tr>
                                <td
                                  style={{
                                    verticalAlign: "top",
                                    textAlign: "left",
                                  }}
                                >
                                  {child}
                                </td>
                              </tr>
                              {/* Add gap spacer between children (not after last child) */}
                              {index < numChildren - 1 && (
                                <tr>
                                  <td style={gapSpacerStyle}>&nbsp;</td>
                                </tr>
                              )}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      children
                    )}
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

export default memo(Column, arePropsEqual);