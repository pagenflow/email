// components/email/Font.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Declarative <Font> component for email <Head>.
// Renders a @font-face rule (with optional MSO VML fallback comment) for a
// single font family + weight + style combination.
//
// Usage (inside <Head>):
//   <Font
//     fontFamily="Roboto"
//     fallbackFontFamily="Verdana"
//     webFont={{
//       url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
//       format: "woff2",
//     }}
//     fontWeight={400}
//     fontStyle="normal"
//   />
// ─────────────────────────────────────────────────────────────────────────────

export type FontFormat =
  | "woff2"
  | "woff"
  | "truetype"
  | "opentype"
  | "svg"
  | "embedded-opentype";

export interface WebFont {
  /** Direct URL to the font file (woff2, woff, ttf, etc.) */
  url: string;
  /** Font format hint used in the CSS src descriptor */
  format: FontFormat;
}

export interface FontProps {
  /** The CSS font-family name, e.g. "Roboto" */
  fontFamily: string;
  /**
   * Fallback font family used:
   *   1. In the MSO (Outlook) conditional comment so Outlook renders the
   *      closest web-safe equivalent.
   *   2. As the CSS font-stack fallback after the web font.
   * Accepts a single string or an array for a prioritised fallback chain.
   */
  fallbackFontFamily?: string | string[];
  /**
   * Web font to load. When omitted the component only emits the MSO fallback
   * comment (useful for system fonts you still want to declare explicitly).
   */
  webFont?: WebFont;
  /** CSS font-weight — numeric (400) or keyword ("bold"). Default: 400 */
  fontWeight?: number | string;
  /** CSS font-style. Default: "normal" */
  fontStyle?: "normal" | "italic" | "oblique";
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normaliseFallbacks(
  fallbackFontFamily: string | string[] | undefined,
): string[] {
  if (!fallbackFontFamily) return [];
  return Array.isArray(fallbackFontFamily)
    ? fallbackFontFamily
    : [fallbackFontFamily];
}

/**
 * Build the CSS font-stack string from the primary family + fallbacks.
 * Wraps names that contain spaces in single quotes.
 */
function buildFontStack(primary: string, fallbacks: string[]): string {
  const quote = (name: string) => (name.includes(" ") ? `'${name}'` : name);
  return [primary, ...fallbacks].map(quote).join(", ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Font({
  fontFamily,
  fallbackFontFamily,
  webFont,
  fontWeight = 400,
  fontStyle = "normal",
}: FontProps) {
  const fallbacks = normaliseFallbacks(fallbackFontFamily);

  const fontFaceCss = webFont
    ? `
@font-face {
  font-family: '${fontFamily}';
  font-style: ${fontStyle};
  font-weight: ${fontWeight};
  font-display: swap;
  src: url('${webFont.url}') format('${webFont.format}');
  mso-font-alt: '${fallbacks[0] ?? "sans-serif"}';
}`.trim()
    : null;

  const msoComment =
    fallbacks.length > 0
      ? `<!--[if mso]>\n<style type="text/css">\n  .${cssClassName(fontFamily)} {\n    font-family: ${buildFontStack(fallbacks[0], fallbacks.slice(1))}, sans-serif !important;\n  }\n</style>\n<![endif]-->`
      : null;

  return (
    <>
      {fontFaceCss && (
        <style
          type="text/css"
          dangerouslySetInnerHTML={{ __html: fontFaceCss }}
        />
      )}
      {/* Render MSO comment via a raw html string injected into a <head>-safe element */}
      {msoComment && (
        <style
          type="text/css"
          dangerouslySetInnerHTML={{
            __html: `</style>${msoComment}<style type="text/css">`,
          }}
        />
      )}
    </>
  );
}

// ── Utility: generate a stable CSS class name from a font family name ─────────
// Used in the MSO conditional comment to scope the fallback rule.
export function cssClassName(fontFamily: string): string {
  return `font-${fontFamily.toLowerCase().replace(/\s+/g, "-")}`;
}
