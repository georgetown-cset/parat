import React from 'react';
import { css } from '@emotion/react';

import { commas } from '../util';

const styles = {
  outerWrapper: css`
    column-gap: 2rem;
    display: grid;
    grid-template-columns: 240px 1fr;
  `,
  statbox: css`
    align-items: center;
    background-color: var(--bright-blue-lighter);
    border: 2px solid var(--bright-blue);
    color: var(--bright-blue);
    display: flex;
    flex-direction: column;
    padding: 1rem 1rem;
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
