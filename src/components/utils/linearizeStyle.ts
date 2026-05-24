import { CSSProperties } from "react";

/**
 * Converts a CSSProperties object to an inline style string suitable for
 * embedding inside a dangerouslySetInnerHTML / VML conditional comment where
 * JSX style objects are not available.
 *
 * Converts camelCase keys to kebab-case (e.g. borderRadius → border-radius).
 * Skips undefined/null values.
 */
export default function linearizeStyle(style: CSSProperties): string {
    return Object.entries(style)
        .filter(([, value]) => value != null)
        .map(([key, value]) => {
            const kebab = key.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
            return `${kebab}:${value}`;
        })
        .join(";");
}