
export { useMultiState } from './useMultiState';

export function debounce(callback, wait) {
  let timeout;
  return (...args) => {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => callback.apply(context, args), wait);
  };
}

/*
 * Per @emotion/utils/types/index.d.ts
 *
 * export interface SerializedStyles {
 *   name: string
 *   styles: string
 *   map?: string
 *   next?: SerializedStyles
 * }
 */
export function isSerializedStyles(obj) {
  return (
    'name' in obj &&
    'styles' in obj
  );
}
