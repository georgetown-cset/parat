import React from 'react';
import { css } from '@emotion/react';

import { Alert, HelpTooltip } from '@eto/eto-ui-components';

import HeaderWithLink from './HeaderWithLink';
import StatBox from './StatBox';
import StatWrapper from './StatWrapper';
import overall from '../static_data/overall_data.json';
import { otherMetricMap } from '../static_data/table_columns';
import { tooltips } from '../static_data/tooltips';

const styles = {
  nonUScountryAlert: css`
    margin: 0 auto;
    max-width: 700px;
  `,
};

const DetailViewWorkforce = ({
  data,
}) => {
  const yearSpanText = <>{overall.years[0]} to {overall.years[overall.years.length-1]}</>;

  const otherMetricsWorkforce = [
    {
      key: 'ai_jobs',
      tooltip: tooltips.detailView.workforce.aiJobs,
    },
    {
      key: 'tt1_jobs',
      tooltip: tooltips.detailView.workforce.tt1Jobs,
    },
  ];

  return (
    <>
      <HeaderWithLink title="Workforce" />

      {data.country !== "United States" &&
        <Alert css={styles.nonUScountryAlert}>
          {data.country === "China" ? (
            <>Zach_TKTK alert about China data</>
          ) : (
            <>Zach_TKTK alert about non-US, non-China data</>
          )}
        </Alert>
      }

      {data.linkedin.length > 0 ?
        <StatWrapper>
          { otherMetricsWorkforce.map(({ key, tooltip }) => (
            <StatBox
              description={
                <span>
                  From {yearSpanText}, {data.name} here is some explanatory text Zach_tktk
                  describing how they had NUMBER jobs of the specified type
                  (#{data.other_metrics[key].rank} rank in PARAT
                  {data.in_sandp_500 && <>, #NUMBER in the S&P500</>})
                  <HelpTooltip smallIcon={true} text={tooltip} />
                </span>
              }
              key={key}
              label={otherMetricMap[key]}
              value={data.other_metrics[key].total}
            />
          ))}
        </StatWrapper>
      :
        <Alert>
          ZACH_TKTK Note about no jobs due to no LinkedIn data
        </Alert>
      }
    </>
  );
};

export default DetailViewWorkforce;
