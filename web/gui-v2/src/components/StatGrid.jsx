import React from 'react';
import { css } from '@emotion/react';

import { breakpoints } from '@eto/eto-ui-components';

const styles = {
  stats: css`
    display: grid;
    gap: 0.5rem;
    grid-template-columns: minmax(0, 400px);
    list-style: none;
    margin: 1rem auto;
    max-width: fit-content;
    padding: 0;

    ${breakpoints.tablet_regular} {
      grid-template-columns: repeat(2, minmax(0, 400px));
    }

    & > li {
      align-content: center;
      border: 1px solid var(--bright-blue-light);
      display: grid;
      gap: 0.5rem;
      grid-template-columns: 80px 1fr;
      max-width: 400px;
      padding: 0.5rem;

      & > div {
        align-items: center;
        display: flex;

        &:first-of-type {
          font-size: 150%;
          justify-content: right;
        }
      }
    }
  `,
};


/**
 * A responsive grid of boxes, each presenting a statistic and an explanation.
 *
 * @param {object} props
 * @param {Array<{stat: ReactNode, text: ReactNode}>} props.entries
 * @returns {JSX.Element}
 */
const StatGrid = ({
  className: appliedClassName,
  css: appliedCss,
  entries,
  id: appliedId,
}) => {
  return (
    <ul
      className={appliedClassName}
      css={[styles.stats, appliedCss]}
      id={appliedId}
    >
      {
        entries.map((entry) => {
          return (
            <li key={entry.text}>
              <div>{entry.stat}</div>
              <div>{entry.text}</div>
            </li>
          );
        })
      }
    </ul>
  );
};

export default StatGrid;
