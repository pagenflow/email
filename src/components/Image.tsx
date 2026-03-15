import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";
import { BorderConfig } from "../types";

export interface ImageConfig {
  /** The source URL of the image. Required. */
  src: string;

  /** Alt text for accessibility. Required. */
  alt: string;

  /** Width of the image. Can be fixed (e.g., "600px") or percentage (e.g., "100%"). */
  width?: string;

  /** Height of the image. Optional, usually auto-calculated if width is set. */
  height?: string;

  maxWidth?: string;
  maxHeight?: string;

  /** Background color of the containing TD/parent element if the image has transparency. */
  backgroundColor?: string;

  /** Padding around the image (applied to the containing TD). */
  padding?: string;

  /** Border radius for the image (CSS only, limited compatibility). */
  borderRadius?: string;

  /** Border configuration for the image. */
  border?: BorderConfig;

  /** Optional URL to make the image clickable */
  href?: string;

  /** Link target attribute (e.g., "_blank" for new window) */
  target?: string;
}

export type ImageProps = {
  config: ImageConfig;
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

function Image({ config, devNode, devMode }: ImageProps) {
  const {
    src,
    alt,
    width,
    height,
    maxHeight,
    maxWidth,
    backgroundColor,
    padding,
    borderRadius,
    border,
    href,
    target,
  } = config;

  // Get border styles
  const borderStyle = getBorderStyle(border);

  // 1. Image Style: Critical for compatibility, especially display: block
  const imgStyle: CSSProperties = {
    // Basic image properties
    display: "block", // Prevents extra vertical space/gaps below the image
    objectFit: "cover", // For controlling how the image fits (modern CSS, may be ignored)

    // Dimensions (using CSS fallback)
    width: width || "100%",
    height: height || "auto",
    maxWidth: maxWidth || "100%",
    maxHeight: maxHeight,

    // Styling
    border: "0", // Ensures no default browser/client border
    borderRadius: borderRadius,

    // Apply border styles to the image itself
    ...borderStyle,
  };

  // 2. Link Style: Ensure no underline or color changes
  const linkStyle: CSSProperties = {
    display: "block",
    textDecoration: "none",
    border: "0",
    outline: "none",
  };

  // 3. TD Style: Where padding and background are reliably applied
  const tdStyle: CSSProperties = {
    padding: padding,
    backgroundColor: backgroundColor,
    fontSize: "0", // CRITICAL: Collapses extra space from Outlook/Gmail
    lineHeight: "0", // CRITICAL: Collapses extra space from Outlook/Gmail
  };

  // Image element with proper attributes for email compatibility
  const imageElement = (
    <img
      draggable={false}
      src={src}
      alt={alt}
      style={imgStyle}
      // For Outlook: Use the smaller of width or maxWidth for the HTML attribute
      width={(() => {
        const widthPx = width?.endsWith("px") ? parseInt(width, 10) : undefined;
        const maxWidthPx = maxWidth?.endsWith("px")
          ? parseInt(maxWidth, 10)
          : undefined;

        if (widthPx && maxWidthPx) {
          return Math.min(widthPx, maxWidthPx);
        }
        return widthPx || maxWidthPx;
      })()}
      height={height?.endsWith("px") ? parseInt(height, 10) : undefined}
      {...{ border: 0 as any }}
    />
  );

  // Wrap image in link if href is provided and not in dev mode
  const content =
    href && !devMode ? (
      <a
        href={href}
        target={target}
        style={linkStyle}
        // Add rel for security when opening in new tab
        {...(target === "_blank" ? { rel: "noopener noreferrer" } : {})}
      >
        {imageElement}
      </a>
    ) : (
      imageElement
    );

  return (
    // We wrap the image in a table to reliably apply padding, background, and alignment.
    <table
      aria-label={`Image Wrapper for: ${alt}`}
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{
        // --- Start dev
        position: "relative",
        // --- End dev

        width: width || "100%",
        borderCollapse: "collapse",
      }}
      onClick={devMode ? (e) => e.preventDefault() : undefined}
    >
      <tbody>
        <tr>
          {/* TD for Padding, Background, and Space Collapse */}
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

export default memo(Image, arePropsEqual);
