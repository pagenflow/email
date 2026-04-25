interface StyleMap {
    [property: string]: string;
}

export interface DomNode {
    tagName: string;
    attributes: Record<string, string>;
    style: StyleMap;
    children: DomNode[];
    parent: DomNode | null;
    rawHtml: string;
}

export default class MiniDomParser {
    private html: string;
    root: DomNode;

    constructor(html: string) {
        this.html = html;
        this.root = this.makeNode("root", {}, null);
        this.parse();
    }

    private makeNode(
        tagName: string,
        attributes: Record<string, string>,
        parent: DomNode | null
    ): DomNode {
        return {
            tagName,
            attributes,
            style: this.parseStyle(attributes["style"] ?? ""),
            children: [],
            parent,
            rawHtml: "",
        };
    }

    parseStyle(styleStr: string): StyleMap {
        const map: StyleMap = {};
        for (const declaration of styleStr.split(";")) {
            const [prop, ...rest] = declaration.split(":");
            if (!prop || !rest.length) continue;
            const key = prop.trim().toLowerCase();
            const val = rest.join(":").trim();
            if (key && val) map[key] = val;
        }
        return map;
    }

    private parseAttributes(attrStr: string): Record<string, string> {
        const attrs: Record<string, string> = {};
        const pattern = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(attrStr)) !== null) {
            const key = m[1].toLowerCase();
            const val = m[2] ?? m[3] ?? m[4] ?? "";
            attrs[key] = val;
        }
        return attrs;
    }

    private parse(): void {
        const tokenPattern = /(<\/[\w]+\s*>|<[\w][^>]*>|[^<]+)/gi;
        const stack: DomNode[] = [this.root];

        let m: RegExpExecArray | null;
        while ((m = tokenPattern.exec(this.html)) !== null) {
            const token = m[0];

            if (token.startsWith("</")) {
                if (stack.length > 1) stack.pop();
                continue;
            }

            if (token.startsWith("<")) {
                const tagMatch = token.match(/^<([\w]+)([\s\S]*)>$/i);
                if (!tagMatch) continue;

                const tagName = tagMatch[1].toLowerCase();
                const attrStr = tagMatch[2].trim();
                const attrs = this.parseAttributes(attrStr);

                const current = stack[stack.length - 1];
                const node = this.makeNode(tagName, attrs, current);
                node.rawHtml = token;
                current.children.push(node);

                const selfClosing =
                    /\/$/.test(attrStr) ||
                    ["br", "hr", "img", "input", "meta", "link"].includes(tagName);
                if (!selfClosing) stack.push(node);
            }
        }
    }

    private collectByTag(node: DomNode, tag: string, results: DomNode[]): void {
        if (node.tagName === tag) results.push(node);
        for (const child of node.children) {
            this.collectByTag(child, tag, results);
        }
    }

    querySelectorAllByTag(tag: string): DomNode[] {
        const results: DomNode[] = [];
        this.collectByTag(this.root, tag.toLowerCase(), results);
        return results;
    }
}