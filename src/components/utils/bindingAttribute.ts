/**
 * bindingAttribute.ts
 * -------------------
 * Serialises DataBindings into discrete HTML attributes:
 *
 *  data-bind-if    → visible condition     → stamped on the root element
 *  data-bind-list  → repeater (dataList + itemAlias) → stamped on the
 *                    direct parent of the children loop, NOT the root
 *  data-bind       → propertyMap           → stamped on the root element
 *
 * Keeping the three concerns in separate attributes lets the post-processor
 * handle them independently without ambiguity.
 */

import { DataBindings } from '../../types/DataBindings';

// ─── Root element props (visible + propertyMap) ───────────────────────────────

/**
 * Props to spread onto the component's root element.
 * Carries `data-bind-if` and/or `data-bind` (propertyMap).
 */
export function rootBindingProps(bindings: DataBindings | undefined): {
    'data-bind-if'?: string;
    'data-bind'?: string;
} {
    if (!bindings) return {};

    const props: { 'data-bind-if'?: string; 'data-bind'?: string } = {};

    if (bindings.visible) {
        props['data-bind-if'] = bindings.visible;
    }

    if (bindings.propertyMap && Object.keys(bindings.propertyMap).length) {
        props['data-bind'] = JSON.stringify({ propertyMap: bindings.propertyMap });
    }

    return props;
}

// ─── List wrapper props (dataList + itemAlias) ────────────────────────────────

/**
 * Props to spread onto the *direct parent* of the children loop.
 * Carries `data-bind-list` only when a repeater is defined.
 *
 * Usage inside a component:
 *   <tbody {...listBindingProps(bindings)}>
 *     {children}
 *   </tbody>
 */
export function listBindingProps(bindings: DataBindings | undefined): {
    'data-bind-list'?: string;
} {
    if (!bindings?.dataList) return {};

    return {
        'data-bind-list': JSON.stringify({
            dataList: bindings.dataList,
            ...(bindings.itemAlias && { itemAlias: bindings.itemAlias }),
        }),
    };
}

// ─── Legacy convenience export (kept for call-sites not yet migrated) ─────────

/** @deprecated Use rootBindingProps + listBindingProps instead. */
export function bindingProps(
    bindings: DataBindings | undefined,
): { 'data-bind'?: string } {
    if (!bindings) return {};
    const value = JSON.stringify(bindings);
    return { 'data-bind': value };
}