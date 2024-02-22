import React from 'react';
import { css } from '@emotion/react';

import { commas } from '../util';

const styles = {
  cell: css`
    display: grid;
    gap: 0.5rem;
    /*
     * 3.2em was chosen because it was a touch above the size needed to safely
     * display a 4-digit company ranking.  If we ever get above 10,000 companies
     * and things start looking funky, just increase this accordingly.
     */
    grid-template-columns: 1fr 3.2em;
    justify-content: center;

    & > div {
      text-align: right;
    }

    .rank {
      color: #a0a0a0;
    }
  `,
};

const CellStat = ({data, colKey}) => {
  return (
    <div css={styles.cell}>
      <div className="val">
        { data?.total === null ? 'n/a' : commas(data.total) }
      </div>
      <div className="rank">
        { (data?.total === 0 || data?.total === null) ? '---' : (data?.rank && `#${data.rank}`) }
      </div>
    </div>
  );
};

export default CellStat;
