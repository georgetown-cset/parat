import React from 'react';
import { css } from '@emotion/react';

import { breakpoints } from '@eto/eto-ui-components';

const styles = {
  stats: css`
    column-gap: 1rem;
    display: grid;
    grid-template-columns: minmax(0, 400px);
    list-style: none;
    margin: 1rem auto;
    max-width: fit-content;
    padding: 0;
    row-gap: 0.5rem;

    ${breakpoints.tablet_regular} {
      grid-template-columns: repeat(2, minmax(0, 400px));
    }

    & > li {
      align-content: center;
      display: grid;
      gap: 0.5rem;
      grid-template-columns: 100px 1fr;
      max-width: 400px;
      padding: 0.5rem;

      & > div {
        align-items: center;
        display: flex;

        &:first-of-type {
          font-family: GTZirkonMedium;
          font-size: 200%;
          justify-content: right;
        }
      }
    }

    span.helptooltip {
      margin-top: -3px;
      vertical-align: middle;
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
            <li key={entry.key ?? entry.text}>
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
