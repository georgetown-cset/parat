
/**
 * 
 * @param {object} storeDefs An object of `useState`-equivalent results, consisting
 *      of an array of the form `[VARIABLE, SET_FUNCTION<, ...>]`.  Entries beyond
 *      the first two (such as from useQueryParamString) are currently ignored.
 * @param {function} getTransform An optional function, of the form
 *      `(key: string, val: any) => any`, to transform from the internally-stored
 *      value into the final external result.  The `key` parameter specifies which
 *      of the stores is being accessed.
 * @param {function} setTransform An optional function, of the form
 *      `(key: string, val: any) => any`, to transform from the externally-provided
 *      value into the value actually stored internally.  The `key` parameter
 *      specifies which of the stores is being accessed.
 * @returns {object} An object of the following form (where `key_one` and `key_two`
 *      were defined in `storeDefs`):
 *      ```
 *      {
 *        key_one: {
 *          get: any,                  // getter to retrieve the current value
 *          set(newVal: any) => void,  // function to update the value
 *        },
 *        key_two: {
 *          get: any,
 *          set(newVal: any) => void,
 *        },
 *        // ...
 *      }
 *      ```
 */
export const useMultiState = (storeDefs, getTransform, setTransform) => {
  if ( typeof getTransform !== "function" ) {
    getTransform = (_key, val) => val;
  }
  if ( typeof setTransform !== "function" ) {
    setTransform = (_key, val) => val;
  }

  return Object.fromEntries(
    Object
      .keys(storeDefs)
      .map(k => [k, {
        get get() { return getTransform(k, storeDefs[k][0]) },
        set: (newVal) => storeDefs[k][1](setTransform(k, newVal)),
      }])
  );
};
