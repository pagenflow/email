import isEqual from "./isEqual";

/**
 * Generic deep equality comparison function for React component props.
 * Can be used with React.memo() to prevent unnecessary re-renders.
 * 
 * @example
 * export default memo(MyComponent, arePropsEqual);
 */
export function arePropsEqual<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean {
  return isEqual(prevProps, nextProps);
}

/**
 * Alternative: More performant version that only compares specific keys
 * Use this if you want to optimize by ignoring certain props like callbacks
 * 
 * @example
 * export default memo(MyComponent, (prev, next) => 
 *    arePropsEqualExcept(prev, next, ['onCallback'])
 * );
 */
export function arePropsEqualExcept<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  excludeKeys: (keyof T)[]
): boolean {
  const prevFiltered = omit(prevProps, excludeKeys);
  const nextFiltered = omit(nextProps, excludeKeys);
  return isEqual(prevFiltered, nextFiltered);
}

/**
 * Alternative: Compare only specific keys for performance
 * Useful when you have large props objects but only care about certain values
 * 
 * @example
 * export default memo(MyComponent, (prev, next) => 
 *   arePropsEqualOnly(prev, next, ['config', 'devMode'])
 * );
 */
export function arePropsEqualOnly<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  includeKeys: (keyof T)[]
): boolean {
  const prevFiltered = pick(prevProps, includeKeys);
  const nextFiltered = pick(nextProps, includeKeys);
  return isEqual(prevFiltered, nextFiltered);
}

function pick<T extends object, K extends keyof T>(data: T, keys: K[]): Pick<T, K> {
  const r = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in data) {
      r[key] = data[key];
    }
  }
  return r;
}

function omit<T extends object, K extends keyof T>(data: T, keys: K[]): Omit<T, K> {
  const r = { ...data };
  for (const key of keys) {
    delete r[key];
  }
  return r;
}