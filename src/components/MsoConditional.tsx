/**
 * MSO conditional comment helpers.
 *
 * Follows the same pattern as Icon.tsx: raw HTML is injected via
 * dangerouslySetInnerHTML on a <td>, which is the only way to emit
 * unescaped conditional comment strings without a post-processing step.
 *
 * Accepts an HTML string (not ReactNode) — the caller is responsible
 * for building the inner HTML, exactly like Icon does with vmlIcon/htmlContent.
 *
 * Usage:
 *
 *   <MsoOnly html={`<img src="..." />`} />
 *   <NonMso html={`<table>...</table>`} />
 */

type Props = { html: string };

/**
 * Content rendered by Outlook Classic only.
 * Outputs: <!--[if mso]> ... <![endif]-->
 */
export function MsoOnly({ html }: Props) {
  return (
    <td
      dangerouslySetInnerHTML={{
        __html: `<!--[if mso]>${html}<![endif]-->`,
      }}
    />
  );
}

/**
 * Content hidden from Outlook Classic, visible in all other clients.
 * Outputs: <!--[if !mso]><!--> ... <!--<![endif]-->
 */
export function NonMso({ html }: Props) {
  return (
    <td
      dangerouslySetInnerHTML={{
        __html: `<!--[if !mso]><!-->${html}<!--<![endif]-->`,
      }}
    />
  );
}