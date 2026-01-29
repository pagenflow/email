import { CSSProperties, Fragment, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import { BorderConfig } from "../types";

export type WidthType = "full" | "fixed";
export type WidthDistributionType = "equals" | "ratio" | "manual";

export interface RatioConstraint {
  mainChildIndex: number;
  value: [number, number];
}

export type ChildrenConstraints =
  | {
      widthDistributionType: "equals";
    }
  | {
      widthDistributionType: "ratio";
      ratio: RatioConstraint;
    }
  | {
      widthDistributionType: "manual";
      widths: string[];
    };

export interface ContainerConfig {
  widthType: WidthType;
  childrenConstraints: ChildrenConstraints;

  shouldWrap?: boolean;
  borderRadius?: string;
  border?: BorderConfig;
  padding?: string;
  gap?: string;
  width?: string;
  height?: string;
  alignItems?: "start" | "center" | "end";
  justifyContent?: "start" | "center" | "end";
  backgroundColor?: string;
  backgroundImage?: {
    src: string;
    repeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
    size?: "auto" | "cover" | "contain";
    position?: string;
  };
}

export type ContainerProps = {
  config: ContainerConfig;
  children: ReactNode;
  devMode?: boolean;
  devNode?: ReactNode;
};

const alignMap: Record<NonNullable<ContainerConfig["alignItems"]>, string> = {
  start: "top",
  center: "middle",
  end: "bottom",
};

type TdAlign = "center" | "left" | "right";

const justifyMap: Record<
  NonNullable<ContainerConfig["justifyContent"]>,
  TdAlign
> = {
  start: "left",
  center: "center",
  end: "right",
};

function getBorderStyle(border?: BorderConfig): CSSProperties {
  if (!border) return {};

  const style: CSSProperties = {};

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

function Container({ children, config, devMode, devNode }: ContainerProps) {
  const { widthType, childrenConstraints } = config;

  const childrenArray = (
    Array.isArray(children) ? children : [children]
  ).filter((child) => child != null) as ReactNode[];
  const numChildren = childrenArray.length;

  const containerWidthPx = (() => {
    if (widthType === "fixed" && config.width && config.width.endsWith("px")) {
      return parseInt(config.width, 10);
    }
    return 600;
  })();

  const gapWidthPx = (() => {
    if (config.gap && config.gap.endsWith("px")) {
      return parseInt(config.gap, 10);
    }
    return 0;
  })();

  const getChildWidths = (() => {
    const { widthDistributionType } = childrenConstraints;
    const totalGapSpace = gapWidthPx * (numChildren > 1 ? numChildren - 1 : 0);
    const remainingContentSpace = containerWidthPx - totalGapSpace;

    switch (widthDistributionType) {
      case "equals":
        const equalContentWidth = remainingContentSpace / numChildren;
        return Array(numChildren).fill(`${equalContentWidth}px`);
      case "ratio": {
        const { ratio } = childrenConstraints as {
          widthDistributionType: "ratio";
          ratio: RatioConstraint;
        };
        const {
          mainChildIndex,
          value: [numerator, denominator],
        } = ratio;

        if (
          numChildren < 2 ||
          mainChildIndex < 0 ||
          mainChildIndex >= numChildren ||
          denominator === 0
        ) {
          const equalFallbackWidth = remainingContentSpace / numChildren;
          return Array(numChildren).fill(`${equalFallbackWidth}px`);
        }

        const mainChildWidth =
          (remainingContentSpace * numerator) / denominator;
        const remainingWidth = remainingContentSpace - mainChildWidth;
        const numOtherChildren = numChildren - 1;
        const otherChildWidth =
          numOtherChildren > 0 ? remainingWidth / numOtherChildren : 0;

        const widths = Array(numChildren).fill(`${otherChildWidth}px`);
        widths[mainChildIndex] = `${mainChildWidth}px`;

        return widths;
      }

      case "manual": {
        const { widths } = childrenConstraints as {
          widthDistributionType: "manual";
          widths: string[];
        };
        return widths.length === numChildren ? widths : [];
      }
      default:
        return [];
    }
  })();

  const outerTableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  // 1. Background TD Style - Background color, border radius, background image
  const backgroundTdStyle: CSSProperties = {
    backgroundColor: config.backgroundColor,
    borderRadius: config.borderRadius,
    maxWidth: widthType === "fixed" ? config.width || "600px" : undefined,
    backgroundImage: config.backgroundImage
      ? `url(${config.backgroundImage.src})`
      : undefined,
    backgroundRepeat: config.backgroundImage?.repeat,
    backgroundSize: config.backgroundImage?.size,
    backgroundPosition: config.backgroundImage?.position,
    // Overflow hidden to clip background to border-radius
    ...(config.borderRadius && { overflow: "hidden" }),
  };

  // 2. Border Table Style - Border and border radius
  const borderTableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: config.borderRadius,
    ...getBorderStyle(config.border),
  };

  // 3. Padding TD Style
  const innerTdStyle: CSSProperties = {
    padding: config.padding,
    width: "100%",
    verticalAlign: config.alignItems ? alignMap[config.alignItems] : "top",
  };

  const contentTableStyle: CSSProperties = {
    width: "100%",
    height: config.height,
    borderCollapse: "collapse",
  };

  const gapTdStyle: CSSProperties = {
    width: config.gap || "0",
    lineHeight: "1px",
    fontSize: "1px",
  };

  const justifyAlign = config.justifyContent
    ? justifyMap[config.justifyContent]
    : "center";
  const containerWidthAttr =
    widthType === "fixed" ? containerWidthPx : undefined;
  const isStacking = config.shouldWrap && numChildren > 1;
  const msoFixedWrapper = "";
  const msoFixedFooter = "";

  const rowElements = childrenArray.map((child, index) => {
    const childTdStyle: CSSProperties = {
      width: getChildWidths[index],
      verticalAlign: config.alignItems ? alignMap[config.alignItems] : "top",
      textAlign: "left",
    };

    if (config.gap && index < numChildren - 1) {
      return (
        <Fragment key={`ctn:${index}`}>
          <td
            key={`child-${index}`}
            className={isStacking ? "stack-td" : undefined}
            width={getChildWidths[index]}
            style={childTdStyle}
          >
            {child}

            {isStacking && (
              <div
                className="mobile-gap-spacer"
                style={{
                  display: "none",
                  fontSize: "0",
                  lineHeight: "0",
                  height: config.gap,
                }}
              >
                &nbsp;
              </div>
            )}
          </td>

          <td
            key={`gap-${index}`}
            className="desktop-gap-column"
            width={config.gap}
            style={gapTdStyle}
          >
            &nbsp;
          </td>
        </Fragment>
      );
    }

    return (
      <td
        key={`child-${index}`}
        className={isStacking ? "stack-td" : undefined}
        width={getChildWidths[index]}
        style={childTdStyle}
      >
        {child}
      </td>
    );
  });

  return (
    <table
      aria-label={`Container | Table Outer`}
      cellPadding={0}
      cellSpacing={0}
      role="presentation"
      border={0}
      style={{
        position: "relative",
        ...outerTableStyle,
      }}
    >
      <tbody>
        <tr>
          <td align={justifyAlign}>
            <div dangerouslySetInnerHTML={{ __html: msoFixedWrapper }} />

            {/* Outer table for width constraint */}
            <table
              className={[
                widthType === "fixed" ? "container-fixed-width" : undefined,
                devMode ? "main-wrapper relative" : undefined,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`Container | Table Middle`}
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              border={0}
              align={justifyAlign}
              style={{
                width: "100%",
                maxWidth:
                  widthType === "fixed" ? config.width || "600px" : undefined,
                borderCollapse: "collapse",
              }}
              width={containerWidthAttr}
            >
              <tbody>
                <tr>
                  {/* Background TD: Background color, border radius, background image */}
                  <td style={backgroundTdStyle}>
                    {/* Border Table: Border and border radius */}
                    <table
                      aria-label={`Container | Border Wrapper`}
                      cellPadding={0}
                      cellSpacing={0}
                      role="presentation"
                      border={0}
                      style={borderTableStyle}
                    >
                      <tbody>
                        <tr>
                          {/* Padding TD */}
                          <td style={innerTdStyle}>
                            {/* Content Table */}
                            <table
                              aria-label={`Container | Content Table`}
                              cellPadding={0}
                              cellSpacing={0}
                              role="presentation"
                              border={0}
                              style={contentTableStyle}
                            >
                              <tbody>
                                <tr>{rowElements}</tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
              {!!devNode && (
                <tfoot>
                  <tr>
                    <td>{devNode}</td>
                  </tr>
                </tfoot>
              )}
            </table>

            <div dangerouslySetInnerHTML={{ __html: msoFixedFooter }} />
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(Container, arePropsEqual);
