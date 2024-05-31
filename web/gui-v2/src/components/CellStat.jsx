import React from 'react';
import { css } from '@emotion/react';
import { Warning as WarningIcon } from '@mui/icons-material';

import { HelpTooltip } from '@eto/eto-ui-components';

import { tooltips } from '../static_data/tooltips';
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
  cellWithTooltip: css`
    /* Add a column for the tooltip to fit in.  Same note as above on 3.2em. */
    grid-template-columns: auto 1fr 3.2em;
  `,
};

const EMPTY_VALUES = [null, '---'];

const tooltipTypes = {
  "United States": {},
  "China": {
    text: tooltips.jobsExplanations.chinaJobs,
    Icon: WarningIcon,
    iconCss: css`fill: var(--orange);`,
  },
  "noData": {
    text: tooltips.jobsExplanations.noData,
    iconCss: css`fill: var(--grey);`,
  },
  "other": {
    text: tooltips.jobsExplanations.otherJobs,
    Icon: WarningIcon,
    iconCss: css`fill: var(--orange);`,
  },
};

const CellStat = ({
  col,
  country = undefined,
  data,
}) => {
  const tooltipType = (country === "United States") ? undefined : (
    (country === "China") ? "China" : (
      (data?.total === null || data?.total === undefined) ? "noData" : (
        country ? "other" : undefined
      )
    )
  );

  return (
    <div css={[styles.cell, tooltipType && styles.cellWithTooltip]}>
      {tooltipType &&
        <HelpTooltip smallIcon={true} {...tooltipTypes[tooltipType]} />
      }
      <div className="val">
        { data?.total === null ? 'n/a' : commas(data.total) }
      </div>
      <div className="rank">
        { (EMPTY_VALUES.includes(data?.total)) ? '---' : (data?.rank && `#${data.rank}`) }
      </div>
    </div>
  );
};

export default CellStat;
