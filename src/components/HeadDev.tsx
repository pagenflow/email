"use client";

import { Fragment, ReactNode, useEffect } from "react";
import ResolvedFont from "../types/ResolvedFont";

export interface HeadDevProps {
  /** Additional elements like custom <style> blocks, <title>, etc. */
  children?: ReactNode;
  /** Global background color (used in CSS reset). */
  backgroundColor?: string;
  /** Subject line for the email title. */
  title?: string;
  /** Array of gap values (e.g. ["8px", "12px", "48px"]) to generate mobile wrap margin-bottom rules */
  rowGaps?: string[];
  fonts?: ResolvedFont[];
}

/**
 * Dev variant of Head component for use in builder canvas.
 * Injects styles directly into document head to maintain email behavior during development.
 *
 * All styles — including @font-face declarations — are injected imperatively into
 * document.head via useEffect. This guarantees correct placement (always in <head>,
 * never in <body>) and correct declaration order (fonts before selectors).
 */
export default function HeadDev({
  children,
  backgroundColor = "#ffffff",
  title = "Email Preview",
  rowGaps = [],
  fonts = [],
}: HeadDevProps) {
  // ── 1. MSO reset + global styles ─────────────────────────────────────────
  useEffect(() => {
    document.title = title;

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
      .builder-canvas p {
        margin: 0;
        margin-block-start: 0px;
        margin-block-end: 0px;
        margin-inline-start: 0px;
        margin-inline-end: 0px;
      }
    `;

    const globalStyles = `
      /* Define builder-canvas as a container for container queries */
      .builder-canvas {
        container-name: builder-canvas;
        container-type: inline-size;
      }

      /* Prevents default blue color and underline for standard <a> tags */
      .builder-canvas .ql-snow .ql-editor a {
        color: inherit;
        text-decoration: none;
        cursor: default;
      }

      .builder-canvas .ql-align-center {
        text-align: inherit !important;
      }

      /* Responsive container styles - Using container query */
      @container builder-canvas (max-width: 768px) {
        .container-fixed-width {
          width: 100% !important;
          max-width: 100% !important;
        }
      }

      @container builder-canvas (max-width: 768px) {
        .hide-on-mobile {
          display: none !important;
          max-height: 0 !important;
          overflow: hidden !important;
          mso-hide: all;
        }
      }

      @container builder-canvas (min-width: 769px) {
        .hide-on-desktop {
          display: none !important;
          max-height: 0 !important;
          overflow: hidden !important;
          mso-hide: all;
        }
      }

      /* Stack columns on mobile - Using container query */
      @container builder-canvas (max-width: 768px) {
        .stack-td {
          width: 100% !important;
          display: block !important;
          float: left;
          clear: both;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }

        .desktop-gap-column {
          width: 0 !important;
          display: none !important;
        }

        .mobile-gap-spacer {
          display: block !important;
          width: 100% !important;
          font-size: 1px !important;
          line-height: 1px !important;
          mso-line-height-rule: exactly;
        }
      }

      /* Heading style reset */
      h1, h2, h3, h4, h5, h6 {
        margin: 0;
        padding: 0;
        font-weight: inherit;
      }
    `;

    // Create or update MSO reset style tag
    let msoStyleTag = document.getElementById(
      "email-mso-reset-styles",
    ) as HTMLStyleElement | null;
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
    ) as HTMLStyleElement | null;
    if (!globalStyleTag) {
      globalStyleTag = document.createElement("style");
      globalStyleTag.id = "email-global-styles";
      globalStyleTag.type = "text/css";
      document.head.appendChild(globalStyleTag);
    }
    globalStyleTag.textContent = globalStyles;

    // Apply background color to builder canvas element directly
    const builderCanvas = document.querySelector(".builder-canvas");
    if (builderCanvas instanceof HTMLElement) {
      builderCanvas.style.backgroundColor = backgroundColor;
    }
  }, [backgroundColor, title, rowGaps]);

  // ── 2. Font injection — always into document.head, always first ──────────
  //
  // @font-face rules MUST live in <head> and be declared BEFORE any selector
  // rules that reference the family name. Injecting them as the firstChild of
  // <head> guarantees both constraints, eliminating FOUT in the canvas and
  // ensuring the browser's font loader can resolve faces before first paint.
  useEffect(() => {
    if (!fonts.length) {
      // Clean up tag if all fonts were removed
      document.getElementById("email-font-faces")?.remove();
      return;
    }

    // insert preload
    fonts.forEach((resolved: ResolvedFont) => {
      resolved.fontProps.forEach(({ webFont }) => {
        if (!webFont) return;
        if (document.querySelector(`link[data-font-preload="${webFont.url}"]`))
          return;

        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "font";
        link.href = webFont.url;
        link.type = `font/${webFont.format}`;
        link.crossOrigin = "anonymous";
        link.dataset.fontPreload = webFont.url;
        document.head.insertBefore(link, document.head.firstChild);
      });
    });

    const fontFaceCss = fonts
      .flatMap((resolved: ResolvedFont) =>
        resolved.fontProps.map(
          ({
            fontFamily,
            fontStyle = "normal",
            fontWeight = 400,
            webFont,
            fallbackFontFamily,
          }) => {
            if (!webFont) return "";

            const fallback = Array.isArray(fallbackFontFamily)
              ? fallbackFontFamily[0]
              : fallbackFontFamily;

            return `@font-face {
  font-family: '${fontFamily}';
  font-style: ${fontStyle};
  font-weight: ${fontWeight};
  font-display: swap;
  src: url('${webFont.url}') format('${webFont.format}');
  mso-font-alt: '${fallback ?? "sans-serif"}';
}`;
          },
        ),
      )
      .filter(Boolean)
      .join("\n");

    let fontStyleTag = document.getElementById(
      "email-font-faces",
    ) as HTMLStyleElement | null;

    if (!fontStyleTag) {
      fontStyleTag = document.createElement("style");
      fontStyleTag.id = "email-font-faces";
      fontStyleTag.type = "text/css";
      // Prepend as the very first child so @font-face is resolved before
      // any other style rules that reference the font family.
      document.head.insertBefore(fontStyleTag, document.head.firstChild);
    }

    fontStyleTag.textContent = fontFaceCss;

    return () => {
      document
        .querySelectorAll("link[data-font-preload]")
        .forEach((el) => el.remove());
      document.getElementById("email-font-faces")?.remove();
    };
  }, [fonts]);

  useEffect(() => {
    if (!fonts.length) return;

    const loadPromises = fonts.flatMap((resolved: ResolvedFont) =>
      resolved.fontProps
        .filter((p) => !!p.webFont)
        .map(
          ({ fontFamily, fontWeight = 400, fontStyle = "normal", webFont }) => {
            const face = new FontFace(
              fontFamily,
              `url('${webFont!.url}') format('${webFont!.format}')`,
              { weight: String(fontWeight), style: fontStyle },
            );
            document.fonts.add(face);
            return face.load().catch(() => {
              // Silently ignore load failures (network offline, etc.)
            });
          },
        ),
    );

    // Once all faces load, force a re-render of the canvas text
    Promise.all(loadPromises).then(() => {
      document
        .querySelectorAll<HTMLElement>(".builder-canvas .ql-editor")
        .forEach((el) => {
          // Toggling a harmless style forces the browser to re-evaluate font matching
          el.style.visibility =
            el.style.visibility === "hidden" ? "" : el.style.visibility;
        });
    });
  }, [fonts]);

  // ── 3. Custom children (additional style tags, etc.) ─────────────────────
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

    return () => {
      // Cleanup custom elements on unmount
      if (customHeadContainer && customHeadContainer.parentNode) {
        customHeadContainer.parentNode.removeChild(customHeadContainer);
      }
    };
  }, [children]);

  // Nothing is rendered into the React tree — all injection is imperative.
  return <Fragment>{children}</Fragment>;
}
