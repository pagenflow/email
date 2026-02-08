import { CSSProperties, memo, ReactNode } from "react";
import IInnerLink from "../types/IInnerLink";
import { arePropsEqual } from "../utils/memoUtils";

export interface IconConfig {
  /** Icon identifier for the Iconify API */
  iconIdentifier?: string;

  /** Width of the icon */
  width?: string | number;

  /** Height of the icon */
  height?: string | number;

  /** Rotation angle in degrees */
  rotate?: number;

  /** Rotation orientation: clockwise or counter-clockwise */
  rotateOrientation?: "cw" | "ccw";

  /** Icon color (hex format for best compatibility) */
  color?: string;

  /** Link configuration for clickable icons */
  innerLink?: IInnerLink;

  /** Background color of the containing TD */
  backgroundColor?: string;

  /** Padding around the icon */
  padding?: string;

  /** Border radius for the icon container */
  borderRadius?: string;

  /** Horizontal alignment within the container */
  justifyContent?: "start" | "center" | "end";
}

export type IconProps = {
  config: IconConfig;
  devNode?: ReactNode;
  devMode?: boolean;
  children?: ReactNode;
};

// Map alignment to HTML 'align' attribute
const justifyMap: Record<
  NonNullable<IconConfig["justifyContent"]>,
  "left" | "center" | "right"
> = {
  start: "left",
  center: "center",
  end: "right",
};

// Helper to build Iconify API URL
function buildIconifyUrl(config: IconConfig): string | null {
  const {
    iconIdentifier,
    height = 24,
    color = "000000",
    rotate = 0,
    rotateOrientation = "cw",
  } = config;

  if (!iconIdentifier) return null;

  // Remove # from color if present
  const cleanColor = color.replace("#", "");

  // Build URL from template
  const template =
    process.env.ICONIFY_API_IMAGE_URI ||
    "https://iconify.pagenflow.com/api/image/{{height}}/{{color}}/{{rotate}}-{{rotate-orientation}}/{{icon-full-name}}.png";

  return template
    .replace("{{height}}", String(Number(height) * Number(2)))
    .replace("{{color}}", cleanColor)
    .replace("{{rotate}}", String(rotate))
    .replace("{{rotate-orientation}}", rotateOrientation)
    .replace("{{icon-full-name}}", iconIdentifier);
}

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

function Icon({ config, devNode, devMode, children }: IconProps) {
  const {
    // base64Source,
    width,
    height,
    backgroundColor,
    padding = "0",
    borderRadius = "0",
    innerLink,
    justifyContent = "center",
  } = config;

  // Determine icon source
  const iconSrc = buildIconifyUrl(config);
  const href = buildLinkHref(innerLink);
  const target = innerLink?.target || "_self";
  const align = justifyMap[justifyContent];

  // Convert width/height to string with px if number
  const widthStr = typeof width === "number" ? `${width}px` : width;
  const heightStr = typeof height === "number" ? `${height}px` : height;

  // Parse numeric values for HTML attributes
  const widthNum =
    typeof width === "number"
      ? width
      : typeof width === "string" && width.endsWith("px")
        ? parseInt(width, 10)
        : undefined;
  const heightNum =
    typeof height === "number"
      ? height
      : typeof height === "string" && height.endsWith("px")
        ? parseInt(height, 10)
        : undefined;

  // 1. Image Style: Critical for compatibility
  const imgStyle: CSSProperties = {
    display: "block", // Prevents extra vertical space
    border: 0, // No default border
    width: widthStr || "auto",
    height: heightStr || "auto",
  };

  // 2. Link Style: No underline or color changes
  const linkStyle: CSSProperties = {
    display: "block",
    textDecoration: "none",
    border: 0,
    outline: "none",
  };

  // 3. TD Style: Padding and background
  const tdStyle: CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    fontSize: "0", // CRITICAL: Collapses extra space
    lineHeight: "0", // CRITICAL: Collapses extra space7
    borderRadius: borderRadius,
    overflow: "hidden",
  };

  // --- VML Calculation for Outlook Compatibility ---
  const numericPadding = parseInt(padding.split(" ")[0] || "0", 10);
  const vmlWidth = (widthNum || 24) + numericPadding * 2;
  const vmlHeight = (heightNum || 24) + numericPadding * 2;

  // VML colors must use full hex format
  const vmlFillColor = backgroundColor?.startsWith("#")
    ? backgroundColor
    : backgroundColor
      ? `#${backgroundColor}`
      : "#ffffff";

  // Calculate arcsize percentage for VML
  const numericBorderRadius = parseInt(borderRadius || "0", 10);
  const arcsize =
    numericBorderRadius > 0
      ? Math.min(
          (numericBorderRadius / Math.min(vmlWidth, vmlHeight)) * 100,
          100,
        )
      : 0;

  // Build VML code for Outlook
  const vmlIcon =
    backgroundColor && numericBorderRadius > 0
      ? `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" ${href && !devMode ? `href="${href}"` : ""} style="height:${vmlHeight}px;width:${vmlWidth}px;v-text-anchor:middle;" arcsize="${arcsize}%" stroke="false" fillcolor="${vmlFillColor}">
      <w:anchorlock/>
      <v:textbox inset="0,0,0,0" style="text-align: center;">
        <center style="padding:${padding};">
          <img src="${iconSrc || ""}" alt="" width="${widthNum || 24}" height="${heightNum || 24}" border="0" style="display:block;border:0;" />
        </center>
      </v:textbox>
    </v:roundrect>
    <![endif]-->
  `
      : "";

  // If no icon source, return empty
  if (!iconSrc && !devMode) {
    return null;
  }

  // Icon image element
  const iconElement =
    devMode && !!children ? (
      children
    ) : iconSrc ? (
      <img
        draggable={false}
        src={iconSrc}
        alt="" // Icons are decorative, empty alt is appropriate
        style={imgStyle}
        width={widthNum}
        height={heightNum}
        {...{ border: 0 as any }}
      />
    ) : (
      <></>
    );

  // Wrap in link if href exists and not in dev mode
  const content =
    href && !devMode ? (
      <a
        href={href}
        target={target}
        style={linkStyle}
        {...(target === "_blank" ? { rel: "noopener noreferrer" } : {})}
      >
        {iconElement}
      </a>
    ) : (
      iconElement
    );

  // Build the HTML content with VML support (only when NOT in dev mode)
  const useVML = !devMode && backgroundColor && numericBorderRadius > 0;

  const htmlContent = useVML
    ? `
    ${vmlIcon}
    <!--[if !mso]><!-->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
      <tbody>
        <tr>
          <td style="background-color: ${backgroundColor}; border-radius: ${borderRadius}; padding: ${padding}; font-size: 0; line-height: 0; overflow: hidden;">
            ${
              href
                ? `<a href="${href}" target="${target}" style="display:block;text-decoration:none;border:0;outline:none;" ${target === "_blank" ? 'rel="noopener noreferrer"' : ""}>
                   <img draggable="false" src="${iconSrc}" alt="" width="${widthNum || 24}" height="${heightNum || 24}" border="0" style="display:block;border:0;width:${widthStr || "auto"};height:${heightStr || "auto"};" />
                 </a>`
                : `<img draggable="false" src="${iconSrc}" alt="" width="${widthNum || 24}" height="${heightNum || 24}" border="0" style="display:block;border:0;width:${widthStr || "auto"};height:${heightStr || "auto"};" />`
            }
          </td>
        </tr>
      </tbody>
    </table>
    <!--<![endif]-->
  `
    : null;

  return (
    <table
      aria-label="Icon"
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      align={align}
      style={{
        // --- Start dev
        position: "relative",
        // --- End dev

        width: widthStr || "auto",
        borderCollapse: "collapse",

        // base
        boxSizing: "border-box",
        border: 0,
        margin: 0,
        padding: 0,
      }}
      onClick={devMode ? (e) => e.preventDefault() : undefined}
    >
      <tbody>
        <tr>
          {useVML ? (
            <td
              dangerouslySetInnerHTML={{
                __html: htmlContent ?? "",
              }}
            />
          ) : (
            <td style={tdStyle} align={align}>
              {content}
            </td>
          )}
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

export default memo(Icon, arePropsEqual);
