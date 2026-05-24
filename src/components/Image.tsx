import { CSSProperties, memo, ReactNode } from "react";
import { BorderConfig } from "../types";
import IInnerLink from "../types/IInnerLink";
import { arePropsEqual } from "../utils/memoUtils";
import { DataBindings } from "../types/DataBindings";
import { rootBindingProps } from "./utils/bindingAttribute";

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
  src?: string;
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
  /**
   * Pixel width constraint for Outlook Classic only.
   *
   * Outlook Classic ignores CSS width/maxWidth on <img> and always renders
   * images at their intrinsic size. The only reliable workaround is a wrapping
   * <td> with a hard pixel `width` attribute, injected inside an MSO
   * conditional comment so it is invisible to every other client.
   *
   * When set, the image is wrapped in:
   *   <!--[if mso]><table><tr><td width="${outlookWidth}"><![endif]-->
   *   <img ... />
   *   <!--[if mso]></td></tr></table><![endif]-->
   *
   * Modern clients (Gmail, Apple Mail, mobile) ignore MSO conditional comments
   * entirely — they never see the wrapping <td> and continue to render the
   * image using its CSS styles alone.
   *
   * Retrocompat: undefined by default. Existing templates that do not set this
   * property are completely unaffected.
   */
  outlookWidth?: string;
}

export type ImageProps = {
  config: ImageConfig;
  devNode?: ReactNode;
  devMode?: boolean;
  previewMode?: boolean;
  bindings?: DataBindings;
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

function Image({ config, devNode, devMode, bindings }: ImageProps) {
  const { src: originalSrc, alt, innerLink, mobile } = config;

  // In dev mode, if there's no src, use the placeholder
  const src =
    devMode && !originalSrc
      ? "https://placehold.co/300x200?text=select+an+image&font=poppins"
      : originalSrc;

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
  const tableWidth = isPercent ? desktopWidth : `${widthAttr}px`;

  // Calculate width attribute for Outlook
  let imgWidthAttr: number | undefined;
  if (config.outlookWidth) {
    // Use explicit outlookWidth if provided
    imgWidthAttr = parseInt(config.outlookWidth, 10);
  } else if (isPercent) {
    // For percentage widths, use maxWidth as fallback for Outlook
    const maxWidthPx = config.maxWidth?.endsWith("px")
      ? parseInt(config.maxWidth, 10)
      : undefined;
    imgWidthAttr = maxWidthPx ?? undefined;
  } else {
    // For fixed pixel widths, use that value
    imgWidthAttr = widthAttr ? parseInt(widthAttr, 10) : undefined;
  }

  // 2. Mobile Overrides
  let mobileCss = "";
  if (mobile) {
    const wrapRules: string[] = ["min-width: 0 !important;"];
    if (mobile.width !== undefined)
      wrapRules.push(`width: ${mobile.width} !important;`);
    if (mobile.maxWidth !== undefined)
      wrapRules.push(`max-width: ${mobile.maxWidth} !important;`);

    const tdRules: string[] = [];
    if (mobile.padding !== undefined)
      tdRules.push(`padding: ${mobile.padding} !important;`);
    if (mobile.backgroundColor !== undefined)
      tdRules.push(`background-color: ${mobile.backgroundColor} !important;`);

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

  // Outlook Classic wrapper - only applied when outlookWidth is explicitly set
  // OR when we need to constrain a percentage-width image in Outlook
  const needsOutlookWrapper =
    config.outlookWidth || (isPercent && imgWidthAttr);

  const finalImageElement = needsOutlookWrapper ? (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            `</style>` +
            `<!--[if mso]>` +
            `<table cellpadding="0" cellspacing="0" border="0" style="width: ${imgWidthAttr}px;">` +
            `<tr>` +
            `<td style="padding: 0; margin: 0;" width="${imgWidthAttr}">` +
            `<img src="${src}" alt="${alt || ""}" width="${imgWidthAttr}" height="${heightAttr !== "auto" ? heightAttr : ""}" style="display: block; width: 100%; height: auto;" />` +
            `</td>` +
            `</tr>` +
            `</table>` +
            `<![endif]-->` +
            `<!--[if !mso]><!-->` +
            `<style>`,
        }}
      />
      {imageElement}
      <style
        dangerouslySetInnerHTML={{
          __html: `</style>` + `<!--<![endif]-->` + `<style>`,
        }}
      />
    </>
  ) : (
    imageElement
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
        align="center"
        {...rootBindingProps(bindings)}
        style={{
          width: tableWidth,
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
                width: tableWidth,
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
                  {finalImageElement}
                </a>
              ) : (
                finalImageElement
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
