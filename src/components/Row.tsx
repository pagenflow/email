import { CSSProperties, Fragment, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import {
  AlignItems,
  BorderConfig,
  JustifyContent,
  TdAlign,
  TdValign,
} from "../types";
import IInnerLink from "../types/IInnerLink";

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

export interface BackgroundImageType {
  src: string;
  repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  size?: "auto" | "cover" | "contain";
  position?: string;
}

export interface RowConfig {
  gap?: string;
  justifyContent?: JustifyContent;
  alignItems?: AlignItems;
  width?: string;
  height?: string;

  // Styling props
  padding?: string;
  backgroundColor?: string;
  backgroundImage?: BackgroundImageType;
  borderRadius?: string;
  border?: BorderConfig;

  // Link support
  innerLink?: IInnerLink;

  // Mobile specific overrides
  mobile?: {
    justifyContent?: JustifyContent;
    alignItems?: AlignItems;
    wrap?: boolean;
  };
}

export type RowProps = {
  children: ReactNode;
  config: RowConfig;
  devNode?: ReactNode;
  devMode?: boolean;
};

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

function getHrefFromInnerLink(innerLink?: IInnerLink): string | undefined {
  if (!innerLink || innerLink.type === "none") return undefined;

  switch (innerLink.type) {
    case "url":
      return innerLink.url;
    case "email":
      return innerLink.email ? `mailto:${innerLink.email}` : undefined;
    case "phone":
      return innerLink.phone ? `tel:${innerLink.phone}` : undefined;
    case "anchor":
      return innerLink.anchor ? `#${innerLink.anchor}` : undefined;
    case "page_top":
      return "#";
    case "page_bottom":
      return "#bottom";
    default:
      return undefined;
  }
}

function Row({ children, config, devNode, devMode }: RowProps) {
  const childrenArray = (
    Array.isArray(children) ? children : [children]
  ).filter((child) => child != null) as ReactNode[];

  const numChildren = childrenArray.length;

  const href = getHrefFromInnerLink(config.innerLink);
  const target = config.innerLink?.target;

  // 1. Outer TD for Background and Border Radius (no border here).
  //    height declared here is the *total* outer height.
  const backgroundTdStyle: React.CSSProperties = {
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,
    width: config.width || "100%",
    height: config.height,

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

  // 2. Inner Table for Border and Border Radius.
  //    height: 100% so it stretches to fill the outer TD.
  const borderTableStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: config.borderRadius,
    ...getBorderStyle(config.border),
  };

  // 3. TD for Padding only — no height.
  //    The outer TD owns the total height; setting height here would cause
  //    browsers/email clients to treat it as content-box height and add
  //    padding on top, making the row taller than the declared height.
  const paddingTdStyle: React.CSSProperties = {
    padding: config.padding,
    width: "100%",
    // height intentionally omitted — padding must be inner, not additive
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

  // Content to render - wrapped in anchor if innerLink is defined
  const content = (
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
          {/* Outer TD: Background, Background Image, Border Radius, Width, Height */}
          <td
            style={backgroundTdStyle}
            {...(config.height && { height: config.height })}
          >
            {/* Inner Table: Border and Border Radius — fills outer TD via height: 100% */}
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
                  {/* Padding TD — no height, padding is inner spacing only */}
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
                              className="content-table row-content-table"
                              data-mobile-justify={
                                config.mobile?.justifyContent
                              }
                              data-mobile-align={config.mobile?.alignItems}
                              data-mobile-wrap={
                                config.mobile?.wrap ? "true" : undefined
                              }
                              data-gap={config.gap}
                            >
                              <tbody>
                                <tr className="content-tr">
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
                                        className="child-cell"
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
                                            className="row-gap-td"
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

  // Wrap in anchor tag if innerLink is defined and NOT in dev mode
  if (href && !devMode) {
    return (
      <a
        href={href}
        {...(target && { target })}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
        }}
      >
        {content}
      </a>
    );
  }

  return content;
}

export default memo(Row, arePropsEqual);
