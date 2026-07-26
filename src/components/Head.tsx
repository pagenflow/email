import { ReactNode } from "react";
import ResolvedFont from "../types/ResolvedFont";
import Font from "./Font";

export interface HeadProps {
  /** Additional elements like custom <style> blocks, <title>, etc. */
  children?: ReactNode;
  /** Global background color (used in CSS reset). */
  backgroundColor?: string;
  /** Subject line for the email title. */
  title?: string;
  /** Array of gap values (e.g. ["8px", "12px", "48px"]) to generate mobile wrap margin-bottom rules */
  rowGaps?: string[];
  /**
   * Resolved fonts from `loadEmailFonts()`.
   * Head will render a <Font> for every variant of every family.
   * This is the preferred API when using the builder pipeline.
   *
   * Example:
   *   const { resolved } = await loadEmailFonts(
   *     extractFontFamilies(doc)
   *   );
   *   <Head fonts={resolved} ... />
   */
  fonts?: ResolvedFont[];
}

export default function Head({
  children,
  backgroundColor = "#ffffff",
  title = "Email Preview",
  rowGaps = [],
  fonts = [],
}: HeadProps) {
  const msoResetStyles = `
        .ExternalClass { width: 100%; line-height: 100%; } 
        .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
        table { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; border-spacing: 0; }
        td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
        #MessageViewBody img { min-width: 100%; }
        a[x-apple-data-detectors] { 
            color: inherit !important; 
            text-decoration: none !important; 
            font-size: inherit !important; 
            font-family: inherit !important; 
            font-weight: inherit !important; 
            line-height: inherit !important; 
        }
        body { background-color: ${backgroundColor} !important; }
        p {
          margin: 0;
          margin-block-start: 0px;
          margin-block-end: 0px;
          margin-inline-start: 0px;
          margin-inline-end: 0px;
        }
    `;

  const globalStyles = `
        @media screen and (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
            max-height: 0 !important;
            overflow: hidden !important;
            mso-hide: all;
          }
        }
        @media screen and (min-width: 769px) {
          .hide-on-desktop {
            display: none !important;
            max-height: 0 !important;
            overflow: hidden !important;
            mso-hide: all;
          }
        }
        @media screen and (max-width: 768px) {
            .stack-td {
                width: 100% !important;
                display: block !important;
                float: left;
                clear: both;
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
            .desktop-gap-column { width: 0 !important; display: none !important; }
            .mobile-gap-spacer {
                display: block !important;
                width: 100% !important;
                font-size: 1px !important;
                line-height: 1px !important;
                mso-line-height-rule: exactly;
            }
        }

        a { color: inherit; text-decoration: none; }
        ol, ul { margin: 0px; padding: 0px; list-style: none; }
        li {
          list-style-type: none !important;
          list-style: none !important;
          position: relative;
          padding-left: 0px;
          margin: 0px;
          display: block !important;
        }
        li::marker {
          content: "" !important;
          font-size: 0px !important;
          line-height: 0px !important;
          color: transparent !important;
          width: 0px !important;
        }
        li[data-list="bullet"] {
          list-style-type: disc !important;
          list-style-position: inside !important;
          padding-left: 1.5em;
          display: list-item !important;
        }
        li[data-list="ordered"] {
          list-style-type: decimal !important;
          list-style-position: inside !important;
          padding-left: 1.5em;
          display: list-item !important;
        }
        li[data-list="bullet"]::marker,
        li[data-list="ordered"]::marker {
          content: normal !important;
          font-size: inherit !important;
          color: inherit !important;
          width: auto !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; font-weight: inherit; }
    `;

  return (
    <head>
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <title>{title}</title>

      {/* ── Font declarations — rendered FIRST, before any text ──────────────
           • fonts prop: auto-rendered from loadEmailFonts() pipeline
           • children <Font>s: manually declared (original API, still works)   */}
      {fonts.flatMap((resolved: ResolvedFont) =>
        resolved.fontProps.map((props, i: number) => (
          <Font
            key={`${resolved.family}-${props.fontWeight}-${props.fontStyle}-${i}`}
            {...props}
          />
        )),
      )}

      {/* Manual <Font> children or any other <style>/<meta> tags */}
      {children}

      <style
        type="text/css"
        dangerouslySetInnerHTML={{ __html: msoResetStyles }}
      />
      <style
        type="text/css"
        dangerouslySetInnerHTML={{ __html: globalStyles }}
      />
    </head>
  );
}
