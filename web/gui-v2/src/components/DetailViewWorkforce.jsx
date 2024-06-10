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
    },
    {
      key: 'tt1_jobs',
    },
  ];

  return (
    <>
      <HeaderWithLink title="Workforce" />

      {data.country !== "United States" &&
        <Alert css={styles.nonUScountryAlert}>
          {data.country === "China" ? (
            <>PARAT workforce data for this Chinese company are unreliable. Use with extreme caution. <a href="zach_tktk" target="_blank" rel="noopener">Read more &gt;&gt;</a></>
          ) : (
            <>PARAT workforce data for this non-U.S. company may be unreliable. Use with caution. <a href="zach_tktk" target="_blank" rel="noopener">Read more &gt;&gt;</a></>
          )}
        </Alert>
      }

      {data.linkedin.length > 0 ?
        <StatWrapper>
          { otherMetricsWorkforce.map(({ key }) => (
            <StatBox
              description={
                <span>
                  From {yearSpanText}, {data.name} employed about NUMBER individuals with jobs of this type 
                  (#{data.other_metrics[key].rank} rank in PARAT
                  {data.in_sandp_500 && <>, #NUMBER in the S&P500</>}). [Revisions tktk]
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
          This company is not included in PARAT's workforce data sources.
        </Alert>
      }
    </>
  );
};

export default DetailViewWorkforce;
