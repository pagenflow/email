import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import { BorderConfig } from "../types";
import { NonMso } from "./MsoConditional";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Style-only mobile overrides. Content props (src, alt, href, target) are excluded. */
export interface ImageMobileConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  border?: BorderConfig;
  /** When true, the mobile version of the image is not rendered at all. */
  hidden?: boolean;
}

export interface ImageConfig {
  src: string;
  alt: string;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  border?: BorderConfig;
  href?: string;
  target?: string;

  /**
   * Mobile-specific style overrides.
   * Only explicitly set properties override the desktop value on mobile.
   * Unset properties fall back to the desktop value.
   */
  mobile?: ImageMobileConfig;
}

export type ImageProps = {
  config: ImageConfig;
  devNode?: ReactNode;
  devMode?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBorderStyle(border?: BorderConfig): CSSProperties {
  if (!border) return {};
  const style: CSSProperties = {};

  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
  } else {
    const hasIndividual =
      border.top || border.right || border.bottom || border.left;
    if (hasIndividual) {
      style.borderTop = "none";
      style.borderRight = "none";
      style.borderBottom = "none";
      style.borderLeft = "none";
    }
  }
  if (border.top)
    style.borderTop = `${border.top.width} ${border.top.style} ${border.top.color}`;
  if (border.right)
    style.borderRight = `${border.right.width} ${border.right.style} ${border.right.color}`;
  if (border.bottom)
    style.borderBottom = `${border.bottom.width} ${border.bottom.style} ${border.bottom.color}`;
  if (border.left)
    style.borderLeft = `${border.left.width} ${border.left.style} ${border.left.color}`;

  return style;
}

function getBorderStyleString(border?: BorderConfig): string {
  if (!border) return "";
  const styles: string[] = [];

  if (border.width && border.style && border.color) {
    styles.push(`border:${border.width} ${border.style} ${border.color};`);
  } else {
    const hasIndividual =
      border.top || border.right || border.bottom || border.left;
    if (hasIndividual) {
      styles.push(
        "border-top:none;",
        "border-right:none;",
        "border-bottom:none;",
        "border-left:none;",
      );
    }
  }
  if (border.top)
    styles.push(
      `border-top:${border.top.width} ${border.top.style} ${border.top.color};`,
    );
  if (border.right)
    styles.push(
      `border-right:${border.right.width} ${border.right.style} ${border.right.color};`,
    );
  if (border.bottom)
    styles.push(
      `border-bottom:${border.bottom.width} ${border.bottom.style} ${border.bottom.color};`,
    );
  if (border.left)
    styles.push(
      `border-left:${border.left.width} ${border.left.style} ${border.left.color};`,
    );

  return styles.join(" ");
}

// ---------------------------------------------------------------------------
// Merged styles helper — applies mobile overrides on top of desktop values
// ---------------------------------------------------------------------------

function mergeConfig(config: ImageConfig, overrides?: ImageMobileConfig) {
  return {
    width: overrides?.width ?? config.width,
    height: overrides?.height ?? config.height,
    maxWidth: overrides?.maxWidth ?? config.maxWidth,
    maxHeight: overrides?.maxHeight ?? config.maxHeight,
    backgroundColor: overrides?.backgroundColor ?? config.backgroundColor,
    padding: overrides?.padding ?? config.padding,
    borderRadius: overrides?.borderRadius ?? config.borderRadius,
    border: overrides?.border ?? config.border,
  };
}

// ---------------------------------------------------------------------------
// Desktop table — JSX (same as original)
// ---------------------------------------------------------------------------

function renderDesktopTable({
  config,
  className,
  devNode,
  devMode,
}: {
  config: ImageConfig;
  className?: string;
  devNode?: ReactNode;
  devMode?: boolean;
}) {
  const { src, alt, href, target } = config;
  const {
    width,
    height,
    maxWidth,
    maxHeight,
    backgroundColor,
    padding,
    borderRadius,
    border,
  } = mergeConfig(config);

  const borderStyle = getBorderStyle(border);

  const imgStyle: CSSProperties = {
    display: "block",
    objectFit: "cover",
    width: width || "100%",
    height: height || "auto",
    maxWidth: maxWidth || "100%",
    maxHeight: maxHeight,
    border: "0",
    borderRadius: borderRadius,
    ...borderStyle,
  };

  const linkStyle: CSSProperties = {
    display: "block",
    textDecoration: "none",
    border: "0",
    outline: "none",
  };

  const tdStyle: CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    fontSize: "0",
    lineHeight: "0",
  };

  const widthNum = width?.endsWith("px") ? parseInt(width, 10) : undefined;
  const maxWidthNum = maxWidth?.endsWith("px")
    ? parseInt(maxWidth, 10)
    : undefined;
  const heightNum = height?.endsWith("px") ? parseInt(height, 10) : undefined;

  const imageElement = (
    <img
      draggable={false}
      src={src}
      alt={alt}
      style={imgStyle}
      width={
        widthNum && maxWidthNum
          ? Math.min(widthNum, maxWidthNum)
          : widthNum || maxWidthNum
      }
      height={heightNum}
      {...{ border: 0 as any }}
    />
  );

  const content =
    href && !devMode ? (
      <a
        href={href}
        target={target}
        style={linkStyle}
        {...(target === "_blank" ? { rel: "noopener noreferrer" } : {})}
      >
        {imageElement}
      </a>
    ) : (
      imageElement
    );

  return (
    <table
      aria-label={`Image Wrapper for: ${alt}`}
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      className={className}
      style={{
        position: "relative",
        width: width || "100%",
        borderCollapse: "collapse",
      }}
      onClick={devMode ? (e) => e.preventDefault() : undefined}
    >
      <tbody>
        <tr>
          <td style={tdStyle} align="center">
            {content}
          </td>
        </tr>
      </tbody>
      {devMode && !!devNode && (
        <tfoot>
          <tr>
            <td>{devNode}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

// ---------------------------------------------------------------------------
// Mobile table — HTML string (injected via NonMso, same pattern as Icon VML)
// ---------------------------------------------------------------------------

function buildMobileTableHTML({
  config,
  overrides,
  className,
}: {
  config: ImageConfig;
  overrides: ImageMobileConfig;
  className: string;
}): string {
  const { src, alt, href, target } = config;
  const {
    width,
    height,
    maxWidth,
    maxHeight,
    backgroundColor,
    padding,
    borderRadius,
    border,
  } = mergeConfig(config, overrides);

  const borderStyleStr = getBorderStyleString(border);

  const widthNum = width?.endsWith("px") ? parseInt(width, 10) : undefined;
  const maxWidthNum = maxWidth?.endsWith("px")
    ? parseInt(maxWidth, 10)
    : undefined;
  const heightNum = height?.endsWith("px") ? parseInt(height, 10) : undefined;
  const resolvedWidth =
    widthNum && maxWidthNum
      ? Math.min(widthNum, maxWidthNum)
      : widthNum || maxWidthNum;

  const imgTag = `<img
    draggable="false"
    src="${src}"
    alt="${alt}"
    ${resolvedWidth ? `width="${resolvedWidth}"` : ""}
    ${heightNum ? `height="${heightNum}"` : ""}
    border="0"
    style="display:block;object-fit:cover;width:${width || "100%"};height:${height || "auto"};max-width:${maxWidth || "100%"};${maxHeight ? `max-height:${maxHeight};` : ""}border:0;${borderRadius ? `border-radius:${borderRadius};` : ""}${borderStyleStr}"
  />`;

  const content = href
    ? `<a href="${href}" target="${target || "_self"}" style="display:block;text-decoration:none;border:0;outline:none;"${target === "_blank" ? ' rel="noopener noreferrer"' : ""}>${imgTag}</a>`
    : imgTag;

  return `
    <table
      aria-label="Image Wrapper for: ${alt}"
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      class="${className}"
      style="position:relative;width:${width || "100%"};border-collapse:collapse;"
    >
      <tbody>
        <tr>
          <td
            align="center"
            style="padding:${padding || ""};background-color:${backgroundColor || ""};font-size:0;line-height:0;"
          >
            ${content}
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function Image({ config, devNode, devMode }: ImageProps) {
  const { mobile } = config;
  const hasMobileOverrides = !!mobile && !mobile.hidden;
  const isHiddenOnMobile = !!mobile?.hidden;

  return (
    <>
      {/*
       * Desktop table — JSX, always rendered.
       *
       * - no mobile config     → no class (shows everywhere)
       * - mobile.hidden = true → hide-on-mobile (hidden on mobile, no mobile table)
       * - mobile overrides set → hide-on-mobile (replaced by mobile table on small screens)
       */}
      {renderDesktopTable({
        config,
        className:
          hasMobileOverrides || isHiddenOnMobile ? "hide-on-mobile" : undefined,
        devNode,
        devMode,
      })}

      {/*
       * Mobile table — HTML string injected via NonMso <td>.
       * Not rendered when mobile.hidden is true — the desktop table
       * simply does not appear on mobile in that case.
       */}
      {hasMobileOverrides && !devMode && (
        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <tbody>
            <tr>
              <NonMso
                html={buildMobileTableHTML({
                  config,
                  overrides: mobile,
                  className: "hide-on-desktop",
                })}
              />
            </tr>
          </tbody>
        </table>
      )}
    </>
  );
}

export default memo(Image, arePropsEqual);
