import React from 'react';
import { css } from '@emotion/react';

import { breakpoints } from '@eto/eto-ui-components';

import { commas } from '../util';

const styles = {
  outerWrapper: css`
    --statbox-border: 2px;
    --statbox-padding: 1rem;
    --statbox-width: 240px;

    column-gap: 1rem;
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 0.5rem;

    ${breakpoints.phone_large} {
      grid-template-columns: var(--statbox-width) 1fr;
    }

    ${breakpoints.tablet_small} {
      column-gap: 2rem;
    }
  `,
  statbox: css`
    align-items: center;
    background-color: var(--bright-blue-lighter);
    border: var(--statbox-border) solid var(--bright-blue);
    color: var(--bright-blue);
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    width: calc(var(--statbox-width) - 2*var(--statbox-padding) - 2*var(--statbox-border));
    padding: var(--statbox-padding);
  `,
  label: css`
    font-size: 1.25rem;
  `,
  value: css`
    font-size: 2.5rem;
  `,
  description: css`
    align-items: center;
    display: flex;
    text-align: center;

    ${breakpoints.phone_large} {
      text-align: start;
    }
  `,
};

const StatBox = ({
  description,
  label,
  value,
}) => {

  return (
    <div css={styles.outerWrapper}>
      <div css={styles.statbox}>
        <div css={styles.value}>{commas(value)}</div>
        <div css={styles.label}>{label}</div>
      </div>
      <div css={styles.description}>{description}</div>
    </div>
  );
};

export default StatBox;
