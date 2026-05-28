/**
 * Data Binding logic for mapping properties to the Data Layer.
 */
export type DataBindings = {
    /** 
     * If defined, this component becomes a repeater. 
     * Path to the array in the Data Layer (e.g., "job_listings" or "co.open_roles").
     */
    dataList?: string;

    /** 
     * The alias used by children to reference current iteration data (e.g., "job").
     */
    itemAlias?: string;

    /** 
     * Conditional rendering logic. String evaluated against the Data Layer.
     * e.g., "role.type === 'Remote'"
     */
    visible?: string;

    /** 
     * Map of config properties to Data Layer paths.
     * Key: The property path in 'config' (e.g., "text" or "src").
     * Value: The path in the Data Layer (e.g., "job.title").
     */
    propertyMap?: Record<string, string | PropertyBinding>;
};

/**
 * A single property binding: a data path plus an ordered chain of filters.
 * 
 * Replaces the previous `Record<string, string>` with a richer structure.
 * 
 * The filter chain is applied left to right (like Liquid's pipe operator):
 *   value | filters[0] | filters[1] | ...
 */
export type PropertyBinding = {
    /** Dot-notation path into the data layer, e.g. "product.price" */
    path: string;
    /** Ordered filter pipeline. Each filter receives the output of the previous one. */
    filters?: PropertyFilter[];
};

/**
 * A literal string value, e.g. "%Y-%m-%d" for date format.
 */
export type FilterParamString = {
    type: "string";
    value: string;
};

/**
 * A literal number value, e.g. 50 for truncate length.
 */
export type FilterParamNumber = {
    type: "number";
    value: number;
};

/**
 * A literal boolean value.
 */
export type FilterParamBoolean = {
    type: "boolean";
    value: boolean;
};

/**
 * A path into the data layer, resolved at runtime.
 * e.g. "product.currency_code" — evaluated against the current data context.
 */
export type FilterParamPath = {
    type: "path";
    value: string; // dot-notation path into the data layer
};

export type FilterParam =
    | FilterParamString
    | FilterParamNumber
    | FilterParamBoolean
    | FilterParamPath;

// ─── Filter ───────────────────────────────────────────────────────────────────

/**
 * A single filter applied to a bound value.
 * 
 * name: always lower_snake_case, e.g. "money", "truncate", "date", "upcase"
 * params: ordered list of parameters. Order matters — matches the filter's signature.
 * 
 * Examples:
 *   { name: "money" }
 *   { name: "truncate", params: [{ type: "number", value: 50 }, { type: "string", value: "…" }] }
 *   { name: "date", params: [{ type: "string", value: "%B %d, %Y" }] }
 *   { name: "prepend", params: [{ type: "path", value: "store.currency_symbol" }] }
 */
export type PropertyFilter = {
    /** lower_snake_case filter name */
    name: string;
    /** Ordered parameters. Omit or leave empty for zero-param filters. */
    params?: FilterParam[];
};