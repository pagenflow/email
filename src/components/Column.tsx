import { CSSProperties, Fragment, memo, ReactNode } from "react";
import { BorderConfig } from "../types";
import { arePropsEqual } from "../utils/memoUtils";
import { DataBindings } from "../types/DataBindings";
import { listBindingProps, rootBindingProps } from "./utils/bindingAttribute";
import isGapZero from "./utils/isGapZero";

export interface BackgroundImageType {
  src: string;
  repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  size?: "auto" | "cover" | "contain";
  position?: string;
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
  // maxWidth constrains the column in modern clients via CSS, and in
  // Outlook Classic (Word rendering engine) via a wrapping center+table
  // pattern: a <center> tag auto-centers the inner table, and the `width`
  // HTML attribute on that table acts as a hard cap that the Word engine
  // respects. The outer column itself keeps width: 100% so it fills its
  // parent in all clients, and the inner table limits the rendered content
  // width without any layout breakage in retro clients.
  maxWidth?: string;

  // NEW: Gap property for spacing between children
  gap?: string;
};

export type ColumnProps = {
  children?: ReactNode;
  config: ColumnConfig;
  devNode?: ReactNode;
  bindings?: DataBindings;
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
function getBorderStyle(border?: BorderConfig): CSSProperties {
  if (!border) return {};

  const style: CSSProperties = {};

  // If a full border is specified, apply it
  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
  } else {
    // If only individual borders are specified, explicitly set others to 'none'
    // to prevent Outlook Classic from showing black borders
    const hasIndividualBorders =
      border.top || border.right || border.bottom || border.left;

    if (hasIndividualBorders) {
      // Default all borders to none
      style.borderTop = "none";
      style.borderRight = "none";
      style.borderBottom = "none";
      style.borderLeft = "none";
    }
  }

  // Override with specific borders if provided
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

function Column({ children, config, devNode, bindings }: ColumnProps) {
  // Process children array for gap support
  const childrenArray = (
    Array.isArray(children) ? children : [children]
  ).filter((child) => child != null) as ReactNode[];
  const numChildren = childrenArray.length;

  // 1. Outer table style: Takes up the full width/height of its parent TD.
  //    height here drives the *total* outer height of the column.
  const outerTableStyle: React.CSSProperties = {
    width: "100%",
    height: config.height,
    borderCollapse: "collapse",
  };

  // 2. Outer TD style: Background and Border Radius (no border here).
  //    height is set so the TD occupies the full declared height.
  //    When maxWidth is set, the outer TD stays at its normal width so it
  //    always fills its parent — the inner maxWidth table (see below) does
  //    the actual capping.
  const outerTdStyle: React.CSSProperties = {
    width: config.width,
    height: config.height,
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,

    // Background Image styles
    backgroundImage: config.backgroundImage
      ? `url(${config.backgroundImage.src})`
      : undefined,
    backgroundRepeat: config.backgroundImage?.repeat,
    backgroundSize: config.backgroundImage?.size,
    backgroundPosition: config.backgroundImage?.position,

    // Overflow hidden to clip background to border-radius
    ...(config.borderRadius && { overflow: "hidden" }),
  };

  // 2b. Inner table style: Border and Border Radius.
  //     height: 100% so it stretches to fill the outer TD's declared height.
  const innerTableStyle: React.CSSProperties = {
    width: "100%",
    height: "100%", // fill the outer TD rather than re-declaring the pixel value
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: config.borderRadius,
    ...getBorderStyle(config.border),
  };

  // 3. Inner TD style: Padding and Vertical Alignment only.
  //    *** No height here. ***
  //    The outer TD/table owns the height; padding is purely inner spacing,
  //    so the total rendered height = declared height (padding is inside).
  const innerTdStyle: React.CSSProperties = {
    padding: config.padding,
    // height intentionally omitted — setting it here would make browsers
    // treat it as content-box height and add padding on top, causing the
    // total to exceed the declared height in preview mode.
    verticalAlign: config.alignItems ? alignMap[config.alignItems] : "top",
    background: "transparent",
  };

  // 4. Gap spacer style (used between children)
  const gapSpacerStyle: React.CSSProperties = {
    height: config.gap || "0",
    lineHeight: "1px",
    fontSize: "1px",
    width: "100%",
    background: "transparent",
  };

  // 5. maxWidth constraining table style (modern clients).
  //    The `width` HTML attribute on this table is what Outlook Classic
  //    (Word engine) reads — it has no concept of max-width, but it does
  //    honour the `width` attribute as a hard column cap.
  //    The CSS max-width here handles modern web/email clients correctly.
  //    <center> around it ensures the constrained block stays horizontally
  //    centred in both the Word engine and standards-based renderers.
  const maxWidthTableStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: config.maxWidth,
    borderCollapse: "collapse",
  };

  // Main content rendering
  const renderContent = () => (
    <table
      aria-label="Column Padding"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={innerTableStyle}
    >
      <tbody>
        <tr>
          {/* Inner TD: Padding and Vertical Alignment only — no height */}
          <td
            style={innerTdStyle}
            valign={
              config.justifyContent ? vAlignMap[config.justifyContent] : "top"
            }
            align={config.alignItems ? alignMap[config.alignItems] : "left"}
            {...(numChildren > 1 ? {} : listBindingProps(bindings))}
          >
            {/* Content wrapper for gap support */}
            {numChildren > 1 ? (
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
                <tbody {...listBindingProps(bindings)}>
                  {childrenArray.map((child, index) => (
                    <Fragment key={`col-child-${index}`}>
                      <tr>
                        <td
                          style={{
                            verticalAlign: config.alignItems
                              ? alignMap[config.alignItems]
                              : "top",
                          }}
                          valign={
                            config.justifyContent
                              ? vAlignMap[config.justifyContent]
                              : "top"
                          }
                          align={
                            config.alignItems
                              ? alignMap[config.alignItems]
                              : "left"
                          }
                        >
                          {child}
                        </td>
                      </tr>
                      {/* Add gap spacer between children (not after last child) */}
                      {index < numChildren - 1 && !isGapZero(config.gap) && (
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
  );

  return (
    <table
      aria-label="Column Wrapper"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      {...rootBindingProps(bindings)}
      style={{
        position: "relative",
        ...outerTableStyle,
      }}
      {...(config.height && { height: config.height })}
    >
      <tbody>
        <tr>
          {/* Outer TD: Background, Border Radius, Width, Height */}
          <td
            style={outerTdStyle}
            {...(config.width && { width: config.width })}
            {...(config.height && { height: config.height })}
          >
            {config.maxWidth ? (
              /*
               * maxWidth wrapper — Outlook Classic compatibility pattern:
               *
               * <center> instructs the Word rendering engine to horizontally
               * centre its child block, equivalent to margin: 0 auto in CSS.
               *
               * The inner table carries the `width` HTML attribute set to the
               * maxWidth value. Outlook Classic reads `width` as a hard pixel
               * cap; it has no concept of max-width so this is the only lever
               * available. Modern clients receive the CSS max-width on the
               * same table and behave correctly.
               *
               * The outer column remains at its normal width so it always
               * fills its parent cell in every client — only the inner
               * content is capped.
               */
              <center>
                <table
                  aria-label="Column Max Width Wrapper"
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  width={config.maxWidth}
                  style={maxWidthTableStyle}
                >
                  <tbody>
                    <tr>
                      <td>{renderContent()}</td>
                    </tr>
                  </tbody>
                </table>
              </center>
            ) : (
              renderContent()
            )}
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
