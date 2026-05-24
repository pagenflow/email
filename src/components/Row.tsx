import { CSSProperties, Fragment, memo, ReactNode } from "react";
import {
  AlignItems,
  BorderConfig,
  JustifyContent,
  TdAlign,
  TdValign,
} from "../types";
import IInnerLink from "../types/IInnerLink";
import { arePropsEqual } from "../utils/memoUtils";
import { DataBindings } from "../types/DataBindings";
import {
  listBindingProps,
  rootBindingProps
} from "./utils/bindingAttribute";

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

  /**
   * When true, the content table uses width:100% so Outlook Classic has a
   * hard boundary and text children can wrap correctly.
   * Use this for rows that contain text blocks alongside images.
   *
   * When false/undefined (default), the content table uses width:auto so
   * children shrink-wrap to their natural sizes — preserving the original
   * behavior. Use this for icon rows, button rows, social link rows.
   */
  fillWidth?: boolean;

  /**
   * Controls how child <td> widths are distributed across the row.
   *
   * - "equal"    → each child gets `${100 / numChildren}%`; table-layout:fixed
   *                is applied so Outlook Classic honours the declaration.
   * - string[]   → explicit width per child (px, %, or mixed), e.g.
   *                ["200px","50%","1px"]. Length must match the number of
   *                children; table-layout:fixed is applied.
   * - undefined  → default / retrocompat: no width is set on child <td>s and
   *                table-layout remains unset, preserving the original
   *                shrink-wrap / fillWidth behaviour.
   *
   * Note: when mixing % and px the author is responsible for ensuring values
   * do not overflow the row width — the same trade-off accepted by MJML and
   * Foundation for Emails.
   */
  layoutColumns?: "equal" | string[];

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
  children?: ReactNode;
  config: RowConfig;
  devNode?: ReactNode;
  devMode?: boolean;
  bindings?: DataBindings;
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

/**
 * Resolves the width for a child <td> at the given index based on layoutColumns.
 *
 * - "equal"   → equal percentage share across all children
 * - string[]  → explicit value at the matching index (px, %, or mixed)
 * - undefined → undefined, so no width attribute is set (retrocompat)
 */
function resolveChildColumnWidth(
  layoutColumns: RowConfig["layoutColumns"],
  index: number,
  numChildren: number,
): string | undefined {
  if (!layoutColumns) return undefined;
  if (layoutColumns === "equal") return `${100 / numChildren}%`;
  return layoutColumns[index];
}

function Row({ children, config, devNode, devMode, bindings }: RowProps) {
  const childrenArray = (
    Array.isArray(children) ? children : [children]
  ).filter((child) => child != null) as ReactNode[];

  const numChildren = childrenArray.length;

  const href = getHrefFromInnerLink(config.innerLink);
  const target = config.innerLink?.target || "_blank";

  // Whether children should stack on mobile.
  // Mirrors Container's isStacking pattern: drives stack-td / desktop-gap-column
  // / mobile-gap-spacer class names so that stacking works via non-@media CSS
  // rules that survive Gmail's stylesheet stripping.
  const isStacking = config.mobile?.wrap === true && numChildren > 1;

  // Whether layoutColumns is active. When true, table-layout:fixed is applied
  // to the content table so Outlook Classic honours the declared column widths.
  const hasLayoutColumns = config.layoutColumns !== undefined;

  // 1. Outer TD: Background, Border Radius, Width, Height.
  const backgroundTdStyle: React.CSSProperties = {
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,
    width: config.width || "100%",
    height: config.height,
    backgroundImage: config.backgroundImage
      ? `url(${config.backgroundImage.src})`
      : undefined,
    backgroundRepeat: config.backgroundImage?.repeat,
    backgroundSize: config.backgroundImage?.size,
    backgroundPosition: config.backgroundImage?.position,
    ...(config.borderRadius && { overflow: "hidden" }),
  };

  // 2. Inner Table: Border and Border Radius.
  const borderTableStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: config.borderRadius,
    ...getBorderStyle(config.border),
  };

  // 3. Padding TD.
  const paddingTdStyle: React.CSSProperties = {
    padding: config.padding,
    width: "100%",
    verticalAlign: "top",
  };

  // 4. Content Table.
  //
  //    fillWidth: false/undefined (default) → width: "auto"
  //      Original behavior. Children shrink-wrap to their natural sizes.
  //      Use for icon rows, button rows, social link rows.
  //      Centering works via the Justification Wrapper TD (align + width="100%").
  //
  //    fillWidth: true → width: "100%"
  //      Content table fills available space, giving Outlook Classic a hard
  //      boundary so text children get a constrained box and line wrapping
  //      triggers correctly. Use for rows containing text + image layouts.
  //
  //    layoutColumns (any value) → additionally applies table-layout: fixed
  //      so Outlook Classic honours the per-child width declarations.
  //      Compatible with both fillWidth modes.
  const contentTableStyle: React.CSSProperties = {
    // When layoutColumns is active, force 100% so Outlook Classic has a
    // concrete boundary to resolve percentage column widths against.
    // table-layout:fixed is meaningless without a fixed reference width.
    width: hasLayoutColumns || config.fillWidth ? "100%" : "auto",
    height: "100%",
    borderCollapse: "collapse",
    minWidth: "1px",
    ...(!config.fillWidth &&
      !hasLayoutColumns && { maxWidth: config.width || "100%" }),
    ...(hasLayoutColumns && { tableLayout: "fixed" }),
  };

  // 5. Gap TD.
  const gapTdStyle: React.CSSProperties = {
    width: config.gap || "0",
    lineHeight: "1px",
    fontSize: "1px",
    background: "transparent",
  };

  const tdAlign = config.justifyContent
    ? justifyMap[config.justifyContent]
    : "left";
  const tdValign = config.alignItems ? alignMap[config.alignItems] : "top";

  const content = (
    <table
      aria-label="Row Outer"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      {...(!href ? rootBindingProps(bindings) : {})}
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
                          {/*
                           * width="100%" as HTML attribute (respected by Outlook Classic)
                           * establishes the outer boundary for text wrapping when fillWidth
                           * is true. align handles justifyContent for both modes:
                           * - fillWidth: false → centers the auto-width content table
                           * - fillWidth: true  → aligns content within the full-width table
                           */}
                          <td
                            align={tdAlign}
                            width="100%"
                            style={{ width: "100%" }}
                          >
                            <table
                              aria-label="Row Content"
                              role="presentation"
                              cellPadding={0}
                              cellSpacing={0}
                              border={0}
                              style={contentTableStyle}
                              {...(config.height && { height: config.height })}
                              className="content-table row-content-table"
                              data-mobile-wrap={
                                config.mobile?.wrap ? "true" : undefined
                              }
                              data-gap={config.gap}
                            >
                              <tbody>
                                <tr
                                  className="content-tr"
                                  {...listBindingProps(bindings)}
                                >
                                  {childrenArray.map((child, index) => {
                                    // Resolve the column width for this child based on
                                    // layoutColumns. undefined when layoutColumns is not set,
                                    // preserving the original behaviour (retrocompat).
                                    const columnWidth = resolveChildColumnWidth(
                                      config.layoutColumns,
                                      index,
                                      numChildren,
                                    );

                                    return (
                                      <Fragment key={`row-child-${index}`}>
                                        <td
                                          align={tdAlign}
                                          // Apply the resolved column width as both the HTML
                                          // width attribute (Outlook Classic) and inline style
                                          // (modern clients). When undefined, neither is set,
                                          // keeping the original shrink-wrap behaviour intact.
                                          {...(columnWidth && {
                                            width: columnWidth,
                                          })}
                                          style={{
                                            verticalAlign: tdValign,
                                            textAlign: tdAlign,
                                            padding: "0",
                                            margin: "0",
                                            ...(columnWidth && {
                                              width: columnWidth,
                                            }),
                                          }}
                                          // Mirror of Container's stack-td pattern: when isStacking,
                                          // the non-@media .stack-td rule forces display:block +
                                          // width:100% on each child, which survives Gmail's
                                          // @media stripping and achieves true mobile stacking.
                                          className={`child-cell${isStacking ? " stack-td" : ""}`}
                                        >
                                          {child}

                                          {/*
                                           * Mirror of Container's mobile-gap-spacer pattern:
                                           * Gap is injected structurally inside each child (not
                                           * between columns) so it survives Gmail. display:none
                                           * keeps it hidden on desktop via the non-@media
                                           * .mobile-gap-spacer rule already defined in Head.tsx.
                                           * Only rendered between children (not after the last).
                                           */}
                                          {isStacking &&
                                            index < numChildren - 1 &&
                                            config.gap && (
                                              <div
                                                className="mobile-gap-spacer"
                                                style={{
                                                  display: "none",
                                                  fontSize: "0",
                                                  lineHeight: "0",
                                                  height: config.gap,
                                                  background: "transparent",
                                                }}
                                              >
                                                &nbsp;
                                              </div>
                                            )}
                                        </td>

                                        {/* Gap between children, not after last */}
                                        {index < numChildren - 1 &&
                                          config.gap && (
                                            <td
                                              key={`row-gap-${index}`}
                                              width={config.gap}
                                              style={gapTdStyle}
                                              // Mirror of Container's desktop-gap-column pattern:
                                              // when isStacking, the non-@media .desktop-gap-column
                                              // rule collapses the between-column gap td so it does
                                              // not create phantom space while children are stacked.
                                              className={`row-gap-td${isStacking ? " desktop-gap-column" : ""}`}
                                            >
                                              &nbsp;
                                            </td>
                                          )}
                                      </Fragment>
                                    );
                                  })}
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

  if (href && !devMode) {
    return (
      <a
        href={href}
        {...(target && { target })}
        {...rootBindingProps(bindings)}
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
