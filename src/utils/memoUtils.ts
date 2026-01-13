import _ from "lodash";

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
  return _.isEqual(prevProps, nextProps);
}

/**
 * Alternative: More performant version that only compares specific keys
 * Use this if you want to optimize by ignoring certain props like callbacks
 * 
 * @example
 * export default memo(MyComponent, (prev, next) => 
 *   arePropsEqualExcept(prev, next, ['onCallback'])
 * );
 */
export function arePropsEqualExcept<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  excludeKeys: (keyof T)[]
): boolean {
  const prevFiltered = _.omit(prevProps, excludeKeys);
  const nextFiltered = _.omit(nextProps, excludeKeys);
  return _.isEqual(prevFiltered, nextFiltered);
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
  const prevFiltered = _.pick(prevProps, includeKeys);
  const nextFiltered = _.pick(nextProps, includeKeys);
  return _.isEqual(prevFiltered, nextFiltered);
}