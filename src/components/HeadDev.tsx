"use client";

import { ReactNode, useEffect } from "react";

export interface HeadDevProps {
  /** Additional elements like custom <style> blocks, <title>, etc. */
  children?: ReactNode;
  /** Global background color (used in CSS reset). */
  backgroundColor?: string;
  /** Subject line for the email title. */
  title?: string;
}

/**
 * Dev variant of Head component for use in builder canvas.
 * Injects styles directly into document head to maintain email behavior during development.
 */
export default function HeadDev({
  children,
  backgroundColor = "#ffffff",
  title = "Email Preview",
}: HeadDevProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // MSO Reset Styles - Scoped to .builder-canvas
    const msoResetStyles = `
            /* Forces Outlook to render 100% width and prevents line-height issues */
            .builder-canvas .ExternalClass { width: 100%; line-height: 100%; } 
            .builder-canvas .ExternalClass p, 
            .builder-canvas .ExternalClass span, 
            .builder-canvas .ExternalClass font, 
            .builder-canvas .ExternalClass td, 
            .builder-canvas .ExternalClass div { line-height: 100%; }
            
            /* Reset tables for MSO and border issues */
            .builder-canvas table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0; }
            .builder-canvas td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            
            /* Reset images */
            .builder-canvas img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
            
            /* Fix for Gmail image wrapping and blue links */
            .builder-canvas #MessageViewBody img { min-width: 100%; }
            
            /* Apple data-detector reset for blue links (Scoped to canvas) */
            .builder-canvas a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
            
            /* Apply background to builder canvas */
            .builder-canvas { background-color: ${backgroundColor ?? "transparent"} !important; }
            
            /* Disable browser default margin */
            .builder-canvas p { margin: 0; }
        `;

    const globalStyles = `
            /* Define builder-canvas as a container for container queries */
            .builder-canvas {
                container-name: builder-canvas;
                container-type: inline-size;
            }

            /* --- NEW UNIVERSAL LINK RESET RULE --- */
            /* Prevents default blue color and underline for standard <a> tags */
            .builder-canvas .ql-snow .ql-editor a {
                color: inherit;       
                text-decoration: none;
                cursor: default;  
            }
            /* ------------------------------------- */

            /* Responsive container styles - Using container query */
            @container builder-canvas (max-width: 600px) {
                /* Target the middle table wrapper, or give the container an identifiable class */
                .container-fixed-width {
                    width: 100% !important;
                    max-width: 100% !important;
                }
            }

            /* Stack columns on mobile - Using container query */
            @container builder-canvas (max-width: 600px) {
                /* 1. Force the individual column cells to stack */
                .stack-td {
                    width: 100% !important;
                    display: block !important;
                    float: left;
                    clear: both;
                    padding-left: 0 !important;
                    padding-right: 0 !important;
                }

                /* Hide the desktop gap column on mobile */
                .desktop-gap-column {
                    width: 0 !important;
                    display: none !important;
                }

                /* Show the hidden mobile spacer (only if gap was defined) */
                .mobile-gap-spacer {
                    display: block !important;
                    width: 100% !important;
                    font-size: 1px !important;
                    line-height: 1px !important;
                    mso-line-height-rule: exactly;
                }
            }

            /* Row aligment on mobile - Using container query */
            @container builder-canvas (max-width: 600px) {
              /* 1. Handling Mobile Alignment (Justify) */
              /* We target the inner table alignment */
              .responsive-row[data-mobile-justify="center"] .content-table {
                margin: 0 auto !important;
                float: none !important;
              }
              .responsive-row[data-mobile-justify="start"] .content-table {
                margin: 0 !important;
                float: left !important;
              }
              .responsive-row[data-mobile-justify="end"] .content-table {
                margin: 0 0 0 auto !important;
                float: right !important;
              }

              /* 2. Handling Mobile Vertical Alignment (Align Items) */
              /* We target the child cells if they are still side-by-side */
              .responsive-row[data-mobile-align="center"] .child-cell {
                vertical-align: middle !important;
              }
              .responsive-row[data-mobile-align="start"] .child-cell {
                vertical-align: top !important;
              }
              .responsive-row[data-mobile-align="end"] .child-cell {
                vertical-align: bottom !important;
              }
            }

            /* ================================================= */
            /* 🔒 HEADING STYLE RESET */
            h1, h2, h3, h4, h5, h6 {
              margin: 0;
              padding: 0;
              font-weight: inherit; /* Disables browser defaults */
            }
            /* ================================================= */
        `;

    // Create or update MSO reset style tag
    let msoStyleTag = document.getElementById(
      "email-mso-reset-styles",
    ) as HTMLStyleElement;
    if (!msoStyleTag) {
      msoStyleTag = document.createElement("style");
      msoStyleTag.id = "email-mso-reset-styles";
      msoStyleTag.type = "text/css";
      document.head.appendChild(msoStyleTag);
    }
    msoStyleTag.textContent = msoResetStyles;

    // Create or update global styles tag
    let globalStyleTag = document.getElementById(
      "email-global-styles",
    ) as HTMLStyleElement;
    if (!globalStyleTag) {
      globalStyleTag = document.createElement("style");
      globalStyleTag.id = "email-global-styles";
      globalStyleTag.type = "text/css";
      document.head.appendChild(globalStyleTag);
    }
    globalStyleTag.textContent = globalStyles;

    // Apply background color to builder canvas
    const builderCanvas = document.querySelector(".builder-canvas");
    if (builderCanvas instanceof HTMLElement) {
      builderCanvas.style.backgroundColor = backgroundColor;
    }

    // Cleanup function
    return () => {
      // Optional: Remove styles on unmount if needed
    };
  }, [backgroundColor, title]);

  // Handle custom children (additional style tags, etc.)
  useEffect(() => {
    if (!children) return;

    // Create a container for custom head elements
    let customHeadContainer = document.getElementById(
      "email-custom-head-elements",
    );
    if (!customHeadContainer) {
      customHeadContainer = document.createElement("div");
      customHeadContainer.id = "email-custom-head-elements";
      customHeadContainer.style.display = "none";
      document.head.appendChild(customHeadContainer);
    }

    // This div will be used to parse and inject custom elements
    const tempDiv = document.createElement("div");

    return () => {
      // Cleanup custom elements on unmount
      if (customHeadContainer && customHeadContainer.parentNode) {
        customHeadContainer.parentNode.removeChild(customHeadContainer);
      }
    };
  }, [children]);

  // This component doesn't render anything visible
  // It only manages head injection via useEffect
  return null;
}
