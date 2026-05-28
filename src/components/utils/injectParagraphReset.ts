// injectParagraphReset.ts

const P_RESET_STYLE = [
    "margin:0",
    "margin-block-start:0px",
    "margin-block-end:0px",
    "margin-inline-start:0px",
    "margin-inline-end:0px",
].join(";");

export default function injectParagraphReset(html: string): string {
    if (!html || !html.includes("<p")) return html;

    return html.replace(/<p(\s[^>]*)?>/gi, (_, attrs = "") => {
        const existingStyle = /style\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] ?? "";
        const mergedStyle = existingStyle
            ? `${existingStyle};${P_RESET_STYLE}`
            : P_RESET_STYLE;
        const cleanAttrs = attrs.replace(/\s*style\s*=\s*"[^"]*"/i, "").trim();
        return cleanAttrs
            ? `<p ${cleanAttrs} style="${mergedStyle}">`
            : `<p style="${mergedStyle}">`;
    });
}