import MiniDomParser, { DomNode } from "./MiniDomParser";

function resolveInheritedStyle(node: DomNode, prop: string): string | undefined {
    let el = node.parent;
    while (el && el.tagName !== "root") {
        const val = el.style[prop];
        if (val && val !== "inherit") return val;
        el = el.parent;
    }
    return undefined;
}

const BROWSER_LINK_DEFAULTS = ["color", "text-decoration"];

function resolveAnchorStyles(anchor: DomNode, fallback?: Record<string, string>): string {
    const resolved: Record<string, string> = { ...anchor.style };

    for (const prop of BROWSER_LINK_DEFAULTS) {
        if (resolved[prop] && resolved[prop] !== "inherit") continue;

        const inherited = resolveInheritedStyle(anchor, prop);
        if (inherited) {
            resolved[prop] = inherited;
        } else if (fallback?.[prop]) {
            resolved[prop] = fallback[prop];
        } else if (prop === "text-decoration") {
            resolved[prop] = "none";
        }
    }

    return Object.entries(resolved)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
}

export default function injectLinkStyles(html: string, fallback?: Record<string, string>): string {
    if (!html || (!html.includes("<a ") && !html.includes("<a>"))) return html;

    const parser = new MiniDomParser(html);
    const anchors = parser.querySelectorAllByTag("a");

    let result = html;

    for (const anchor of anchors) {
        const resolvedStyle = resolveAnchorStyles(anchor, fallback ?? {});

        const cleanAttrs = anchor.rawHtml
            .replace(/^<a\s*/i, "")
            .replace(/>$/, "")
            .replace(/style\s*=\s*(?:"[^"]*"|'[^']*')/gi, "")
            .trim();

        const newTag = `<a ${cleanAttrs} style="${resolvedStyle}">`.replace(/\s+/g, " ");
        result = result.replace(anchor.rawHtml, newTag);
    }

    return result;
}