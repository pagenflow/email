import { CSSProperties, memo, ReactNode } from "react";
import { arePropsEqual } from "../utils/memoUtils";

export interface ImageConfig {
  /** The source URL of the image. Required. */
  src: string;

  /** Alt text for accessibility. Required. */
  alt: string;

  /** Width of the image. Can be fixed (e.g., "600px") or percentage (e.g., "100%"). */
  width?: string;

  /** Height of the image. Optional, usually auto-calculated if width is set. */
  height?: string;

  /** Background color of the containing TD/parent element if the image has transparency. */
  backgroundColor?: string;

  /** Padding around the image (applied to the containing TD). */
  padding?: string;

  /** Border radius for the image (CSS only, limited compatibility). */
  borderRadius?: string;

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

function Image({ config, devNode, devMode }: ImageProps) {
  const {
    src,
    alt,
    width,
    height,
    backgroundColor,
    padding,
    borderRadius,
    href,
    target,
  } = config;

  // 1. Image Style: Critical for compatibility, especially display: block
  const imgStyle: CSSProperties = {
    // Basic image properties
    display: "block", // Prevents extra vertical space/gaps below the image
    objectFit: "cover", // For controlling how the image fits (modern CSS, may be ignored)

    // Dimensions (using CSS fallback)
    width: width || "100%",
    height: height || "auto",
    maxWidth: "100%",

    // Styling
    border: "0", // Ensures no default browser/client border
    borderRadius: borderRadius,
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
      width={width?.endsWith("px") ? parseInt(width, 10) : undefined}
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
    >
      <tbody>
        <tr>
          {/* TD for Padding, Background, and Space Collapse */}
          <td style={tdStyle} align="center">
            {content}
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

export default memo(Image, arePropsEqual);
