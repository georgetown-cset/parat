
import slugify from 'slugify';

export { useMultiState } from './useMultiState';
export { useWindowSize } from './useWindowSize';

export const cleanFalse = (array) => array.filter(e => e !== false);

export const commas = (
  num,
  { maximumFractionDigits } = { maximumFractionDigits: 2 },
) => num?.toLocaleString("en-US", { maximumFractionDigits }) ?? "";

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


/**
 * Slugify a company name in a PARAT-standard way.
 *
 * @param {string} name The name of a company
 * @returns A slugified form of the name, using the standard format in PARAT
 */
export function slugifyCompanyName(name) {
  const INVALID_CHARS = /[()'"]/g;
  return name ? slugify(name, { lower: true, remove: INVALID_CHARS }) : "";
}
