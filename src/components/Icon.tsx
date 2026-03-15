import { CSSProperties, memo, ReactNode } from "react";
import IInnerLink from "../types/IInnerLink";
import { arePropsEqual } from "../utils/memoUtils";
import { BorderConfig } from "../types";

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

  /** Border configuration for the icon container */
  border?: BorderConfig;

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

function getBorderStyleString(border?: BorderConfig): string {
  if (!border) return "";

  const styles: string[] = [];

  // If a full border is specified, apply it
  if (border.width && border.style && border.color) {
    styles.push(`border: ${border.width} ${border.style} ${border.color};`);
  } else {
    // If only individual borders are specified
    const hasIndividualBorders =
      border.top || border.right || border.bottom || border.left;

    if (hasIndividualBorders) {
      // Default all borders to none
      styles.push("border-top: none;");
      styles.push("border-right: none;");
      styles.push("border-bottom: none;");
      styles.push("border-left: none;");
    }
  }

  // Override with specific borders if provided
  if (border.top) {
    styles.push(
      `border-top: ${border.top.width} ${border.top.style} ${border.top.color};`,
    );
  }
  if (border.right) {
    styles.push(
      `border-right: ${border.right.width} ${border.right.style} ${border.right.color};`,
    );
  }
  if (border.bottom) {
    styles.push(
      `border-bottom: ${border.bottom.width} ${border.bottom.style} ${border.bottom.color};`,
    );
  }
  if (border.left) {
    styles.push(
      `border-left: ${border.left.width} ${border.left.style} ${border.left.color};`,
    );
  }

  return styles.join(" ");
}

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

  // Parse height to extract numeric value
  const parseHeight = (h: string | number): number => {
    if (typeof h === "number") return h;
    // Extract numeric value from string (e.g., "24px" -> 24)
    const match = String(h).match(/^(-?\d*\.?\d+)/);
    return match ? parseFloat(match[1]) : 24;
  };

  const numericHeight = parseHeight(height);

  // Remove # from color if present
  const cleanColor = color.replace("#", "");

  // Build URL from template
  const template =
    process.env.ICONIFY_API_IMAGE_URI ||
    "https://iconify.pagenflow.com/api/image/{{height}}/{{color}}/{{rotate}}-{{rotate-orientation}}/{{icon-full-name}}.png";

  return template
    .replace("{{height}}", String(numericHeight * 2))
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
    border,
    innerLink,
    justifyContent = "center",
  } = config;

  // Determine icon source
  const iconSrc = buildIconifyUrl(config);
  const href = buildLinkHref(innerLink);
  const target = innerLink?.target || "_self";
  const align = justifyMap[justifyContent];

  // Get border styles
  const borderStyle = getBorderStyle(border);
  const borderStyleString = getBorderStyleString(border);

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
    objectFit: "contain",
  };

  // 2. Link Style: No underline or color changes
  const linkStyle: CSSProperties = {
    display: "block",
    textDecoration: "none",
    border: 0,
    outline: "none",
  };

  // 3. Outer TD Style: Background and border-radius wrapper with border
  const outerTdStyle: CSSProperties = {
    backgroundColor: backgroundColor,
    borderRadius: borderRadius,
    overflow: "hidden",
    fontSize: "0",
    lineHeight: "0",
  };

  // 4. Inner Table Style: Apply border here with border-collapse: separate
  const innerTableStyle: CSSProperties = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    borderRadius: borderRadius,
    ...borderStyle,
  };

  // 5. Inner TD Style: Padding
  const innerTdStyle: CSSProperties = {
    padding: padding,
    fontSize: "0", // CRITICAL: Collapses extra space
    lineHeight: "0", // CRITICAL: Collapses extra space
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

  // VML stroke color for border
  const vmlStrokeColor = border?.color || vmlFillColor;
  const vmlStrokeWeight = border?.width ? parseInt(border.width, 10) : 0;
  const hasVmlStroke = vmlStrokeWeight > 0;

  // Build VML code for Outlook
  const vmlIcon =
    backgroundColor && numericBorderRadius > 0
      ? `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" ${href && !devMode ? `href="${href}"` : ""} style="height:${vmlHeight}px;width:${vmlWidth}px;v-text-anchor:middle;" arcsize="${arcsize}%" ${hasVmlStroke ? `strokecolor="${vmlStrokeColor}" strokeweight="${vmlStrokeWeight}px"` : 'stroke="false"'} fillcolor="${vmlFillColor}">
      <w:anchorlock/>
      <v:textbox inset="0,0,0,0" style="text-align: center;">
        <center style="padding:${padding};">
          <img src="${iconSrc || ""}" alt="" width="${widthNum || 24}" height="${heightNum || 24}" border="0" style="display:block;border:0;object-fit:contain;" />
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
        alt=""
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
          <td style="background-color: ${backgroundColor}; border-radius: ${borderRadius}; overflow: hidden; font-size: 0; line-height: 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: separate; border-spacing: 0; border-radius: ${borderRadius}; width: 100%; ${borderStyleString}">
              <tbody>
                <tr>
                  <td style="padding: ${padding}; font-size: 0; line-height: 0;">
                    ${
                      href
                        ? `<a href="${href}" target="${target}" style="display:block;text-decoration:none;border:0;outline:none;" ${target === "_blank" ? 'rel="noopener noreferrer"' : ""}>
                           <img draggable="false" src="${iconSrc}" alt="" width="${widthNum || 24}" height="${heightNum || 24}" border="0" style="display:block;border:0;width:${widthStr || "auto"};height:${heightStr || "auto"};object-fit:contain;" />
                         </a>`
                        : `<img draggable="false" src="${iconSrc}" alt="" width="${widthNum || 24}" height="${heightNum || 24}" border="0" style="display:block;border:0;width:${widthStr || "auto"};height:${heightStr || "auto"};object-fit:contain;" />`
                    }
                  </td>
                </tr>
              </tbody>
            </table>
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

        width: "auto",
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
            <td style={outerTdStyle} align={align}>
              <table
                role="presentation"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={innerTableStyle}
              >
                <tbody>
                  <tr>
                    <td style={innerTdStyle} align={align}>
                      {content}
                    </td>
                  </tr>
                </tbody>
              </table>
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
