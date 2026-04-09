import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import { BorderConfig } from "../types";
import IInnerLink from "../types/IInnerLink";

/**
 * RULES NOT TO BE REMOVED
 * -------------------
 * - Image should not be draggable in dev mode as we don't want to disrupt the builder dnd behavior
 */

// ---------------------------------------------------------------------------
// Types & Helpers (Kept internal for zero-dependency portability)
// ---------------------------------------------------------------------------

export interface ImageMobileConfig {
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  border?: BorderConfig;
  objectFit?: CSSProperties["objectFit"];
  objectPosition?: string;
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
  innerLink?: IInnerLink;
  /**
   * @deprecated Use innerLink property instead
   */
  href?: string;
  /**
   * @deprecated Use innerLink property instead
   */
  target?: string;
  objectFit?: CSSProperties["objectFit"];
  objectPosition?: string;
  mobile?: ImageMobileConfig;
}

export type ImageProps = {
  config: ImageConfig;
  devNode?: ReactNode;
  devMode?: boolean;
  previewMode?: boolean;
};

// Helper to build link href based on innerLink type
function buildLinkHref(innerLink?: IInnerLink): string | null {
  if (!innerLink || innerLink.type === "none") return null;

  switch (innerLink.type) {
    case "url":
      return innerLink.url || null;
    case "email":
      return innerLink.email ? `mailto:${innerLink.email}` : null;
    case "phone":
      return innerLink.phone ? `tel:${innerLink.phone}` : null;
    case "anchor":
      return innerLink.anchor ? `#${innerLink.anchor}` : null;
    case "page_top":
      return "#top";
    case "page_bottom":
      return "#bottom";
    default:
      return null;
  }
}

function getBorderStyle(border?: BorderConfig): CSSProperties {
  if (!border) return {};
  const style: CSSProperties = {};
  if (border.width && border.style && border.color) {
    style.border = `${border.width} ${border.style} ${border.color}`;
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

  // Standard shorthand
  if (border.width && border.style && border.color) {
    styles.push(
      `border:${border.width} ${border.style} ${border.color} !important;`,
    );
  } else {
    // If desktop had a border and mobile wants "none", we must explicitly kill it
    styles.push(`border: none !important;`);
  }

  // Individual sides
  if (border.top)
    styles.push(
      `border-top:${border.top.width} ${border.top.style} ${border.top.color} !important;`,
    );
  if (border.right)
    styles.push(
      `border-right:${border.right.width} ${border.right.style} ${border.right.color} !important;`,
    );
  if (border.bottom)
    styles.push(
      `border-bottom:${border.bottom.width} ${border.bottom.style} ${border.bottom.color} !important;`,
    );
  if (border.left)
    styles.push(
      `border-left:${border.left.width} ${border.left.style} ${border.left.color} !important;`,
    );

  return styles.join(" ");
}

function Image({ config, devNode, devMode }: ImageProps) {
  const { src, alt, innerLink, mobile } = config;

  // Resolve href and target from innerLink
  const href = buildLinkHref(innerLink);
  const target = innerLink?.target || "_blank";

  const seed = src + (alt || "");
  const instanceId = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString(36);
  const imgClass = `img-${instanceId}`;

  // 1. Desktop Dimensional Logic
  const desktopWidth = config.width || "100%";
  const isPercent = desktopWidth.includes("%");
  const widthAttr = desktopWidth.replace("px", "");
  const heightAttr = config.height?.replace("px", "");

  // Determine the table's "initial" width.
  // If it's 300px, the table should be 300px, not 100%.
  const tableWidth = isPercent ? desktopWidth : `${widthAttr}px`;

  // When width is a percentage, Outlook ignores CSS and renders the image at
  // its intrinsic pixel size. Setting a concrete `width` HTML attribute gives
  // Outlook a value to constrain against while modern clients continue to use
  // the CSS `width: 100%` for fluid rendering.
  //
  // If `maxWidth` is a pixel value (e.g. "600px"), we extract the number and
  // use it as the HTML `width` attribute so Outlook enforces that cap.
  // Other clients ignore the attribute and rely on CSS styles instead.
  // If `maxWidth` is not set or is not a pixel value (e.g. "100%"), we fall
  // back to the original behaviour (numeric string for px widths, undefined
  // for % widths).
  const maxWidthPx = config.maxWidth?.endsWith("px")
    ? parseInt(config.maxWidth, 10)
    : undefined;

  const imgWidthAttr = isPercent ? (maxWidthPx ?? undefined) : widthAttr;

  // 2. Mobile Overrides — only emit CSS properties that are explicitly set,
  // so unspecified properties are left untouched (no forced defaults).
  let mobileCss = "";
  if (mobile) {
    // .wrap-${imgClass} rules
    const wrapRules: string[] = [
      // Always reset min-width so the px lock from desktop can be overridden
      "min-width: 0 !important;",
    ];
    if (mobile.width !== undefined)
      wrapRules.push(`width: ${mobile.width} !important;`);
    if (mobile.maxWidth !== undefined)
      wrapRules.push(`max-width: ${mobile.maxWidth} !important;`);

    // .td-${imgClass} rules
    const tdRules: string[] = [];
    if (mobile.padding !== undefined)
      tdRules.push(`padding: ${mobile.padding} !important;`);
    if (mobile.backgroundColor !== undefined)
      tdRules.push(`background-color: ${mobile.backgroundColor} !important;`);

    // .${imgClass} rules
    const imgRules: string[] = [];
    if (mobile.width !== undefined)
      imgRules.push(`width: ${mobile.width} !important;`);
    if (mobile.height !== undefined)
      imgRules.push(`height: ${mobile.height} !important;`);
    if (mobile.maxWidth !== undefined)
      imgRules.push(`max-width: ${mobile.maxWidth} !important;`);
    if (mobile.maxHeight !== undefined)
      imgRules.push(`max-height: ${mobile.maxHeight} !important;`);
    if (mobile.borderRadius !== undefined)
      imgRules.push(`border-radius: ${mobile.borderRadius} !important;`);
    if (mobile.hidden !== undefined)
      imgRules.push(`display: ${mobile.hidden ? "none" : "block"} !important;`);
    if (mobile.objectFit !== undefined)
      imgRules.push(`object-fit: ${mobile.objectFit} !important;`);
    if (mobile.objectPosition !== undefined)
      imgRules.push(`object-position: ${mobile.objectPosition} !important;`);
    if (mobile.border !== undefined)
      imgRules.push(getBorderStyleString(mobile.border));

    mobileCss = `
      @media screen and (max-width: 768px) {
        .wrap-${imgClass} {
          /* This breaks the px lock from desktop and makes it fluid */
          ${wrapRules.join("\n          ")}
        }
        .td-${imgClass} {
          ${tdRules.join("\n          ")}
        }
        .${imgClass} {
          ${imgRules.join("\n          ")}
        }
      }
    `;
  }

  const imgStyle: CSSProperties = {
    display: "block",
    width: isPercent ? "100%" : desktopWidth,
    height: config.height || "auto",
    maxWidth: config.maxWidth || "100%",
    maxHeight: config.maxHeight || "none",
    borderRadius: config.borderRadius || "0",
    ...getBorderStyle(config.border),
    outline: "none",
    textDecoration: "none",
    objectFit: config.objectFit,
    objectPosition: config.objectPosition,
  };

  const imageElement = (
    <img
      src={src}
      alt={alt}
      width={imgWidthAttr}
      height={heightAttr !== "auto" ? heightAttr : undefined}
      className={imgClass}
      style={imgStyle}
      draggable={!devMode}
    />
  );

  return (
    <>
      {mobile && <style dangerouslySetInnerHTML={{ __html: mobileCss }} />}
      <table
        role="presentation"
        cellPadding={0}
        cellSpacing={0}
        border={0}
        className={`wrap-${imgClass}`}
        align="center" // Ensures a 300px image stays centered in its parent
        style={{
          width: tableWidth, // Fixed px here prevents the 100% "ghost space"
          maxWidth: "100%",
          borderCollapse: "collapse",
          margin: "0 auto",
        }}
      >
        <tbody>
          <tr>
            <td
              className={`td-${imgClass}`}
              align="center"
              style={{
                padding: config.padding,
                backgroundColor: config.backgroundColor,
                fontSize: "0",
                lineHeight: "0",
                width: tableWidth, // Lock the cell as well
              }}
            >
              {href && !devMode ? (
                <a
                  href={href}
                  target={target}
                  {...(target === "_blank"
                    ? { rel: "noopener noreferrer" }
                    : {})}
                  style={{ display: "block", width: "100%" }}
                >
                  {imageElement}
                </a>
              ) : (
                imageElement
              )}
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
    </>
  );
}

export default memo(Image, arePropsEqual);
