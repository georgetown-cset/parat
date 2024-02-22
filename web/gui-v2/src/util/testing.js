import createCache from '@emotion/cache';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Turn off Emotion's persistant and incredibly annoying warning that `:first-child`
// and `:nth-child` are "potentially unsafe when doing server-side rendering",
// even though we aren't using SSR and it has no effect on this.
// Derived from https://github.com/emotion-js/emotion/issues/1105#issuecomment-557726922
const emotionCache = createCache({
  key: 'eto-emotion-cache',
});
emotionCache.compat = true;
export { emotionCache };

export function userEventSetup(jsx) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  }
}
