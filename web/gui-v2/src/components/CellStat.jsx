import React from 'react';
import { css } from '@emotion/react';

import { commas } from '../util';

const styles = {
  cell: css`
    display: flex;
    justify-content: center;

    .rank {
      color: #a0a0a0;
      margin-left: 0.5rem;
    }
  `,
};

const CellStat = ({data, colKey}) => {
  return (
    <div css={styles.cell}>
      <span className="val">{commas(data.total)}</span> <span className="rank">#{data.rank}</span>
    </div>
  );
};

export default CellStat;
