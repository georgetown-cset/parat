import React from 'react';
import { css } from '@emotion/react';

import { commas } from '../util';

const styles = {
  cell: css`
    display: grid;
    grid-template-columns: 60% 40%;
    justify-content: center;

    & > div {
      text-align: right;
    }

    .rank {
      color: #a0a0a0;
      margin-left: 0.5rem;
    }
  `,
};

const CellStat = ({data, colKey}) => {
  return (
    <div css={styles.cell}>
      <div className="val">{commas(data.total)}</div>
      <div className="rank">#{data.rank}</div>
    </div>
  );
};

export default CellStat;
