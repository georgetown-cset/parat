import React from 'react';
import { css } from '@emotion/react';

import { commas } from '../util';

const styles = {
  statbox: css`
    align-items: center;
    background-color: var(--bright-blue-lighter);
    border: 2px solid var(--bright-blue);
    color: var(--bright-blue);
    display: flex;
    flex-direction: column;
    padding: 1rem 3rem;
  `,
  label: css`
    font-size: 1.25rem;
  `,
  value: css`
    font-size: 2.5rem;
  `,
};

const StatBox = ({
  label,
  value,
}) => {

  return (
    <div css={styles.statbox}>
      <div css={styles.value}>{commas(value)}</div>
      <div css={styles.label}>{label}</div>
    </div>
  );
};

export default StatBox;
