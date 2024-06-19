import React from 'react';
import { css } from '@emotion/react';

import { Alert, HelpTooltip, ExternalLink } from '@eto/eto-ui-components';

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
      description: (
        <span>
          From {yearSpanText}, {data.name} employed about NUMBER AI workers
          (#{data.other_metrics.ai_jobs.rank} rank in PARAT
          {data.groups.sp500 && <>, #{data.other_metrics.ai_jobs.sp500_rank} in the S&P500</>}).
          AI workers in PARAT include anyone a high probability of working with AI. <ExternalLink href="https://eto.tech/dataset-docs/private-sector-ai-indicators/#workforce">Read more &gt;&gt;</ExternalLink>
        </span>
      ),
    },
    {
      key: 'tt1_jobs',
      description: (
        <span>
          From {yearSpanText}, {data.name} employed about NUMBER Tech Tier 1 workers
          (#{data.other_metrics.tt1_jobs.rank} rank in PARAT
          {data.groups.sp500 && <>, #{data.other_metrics.tt1_jobs.sp500_rank} in the S&P500</>}).
          Tech Tier 1 workers include anyone with technical skills and a reasonable probability of working with AI. <ExternalLink href="https://eto.tech/dataset-docs/private-sector-ai-indicators/#workforce">Read more &gt;&gt;</ExternalLink>
        </span>
      ),
    },
  ];

  return (
    <>
      <HeaderWithLink title="Workforce" />

      {data.country !== "United States" &&
        <Alert css={styles.nonUScountryAlert}>
          {data.country === "China" ? (
            <>PARAT workforce data for this Chinese company are unreliable. Use with extreme caution. <a href="https://eto.tech/dataset-docs/private-sector-ai-indicators/#limitations-4" target="_blank" rel="noopener">Read more &gt;&gt;</a></>
          ) : (
            <>PARAT workforce data for this non-U.S. company may be unreliable. Use with caution. <a href="https://eto.tech/dataset-docs/private-sector-ai-indicators/#limitations-4" target="_blank" rel="noopener">Read more &gt;&gt;</a></>
          )}
        </Alert>
      }

      {data.linkedin.length > 0 ?
        <StatWrapper>
          { otherMetricsWorkforce.map(({ description, key }) => (
            <StatBox
              description={description}
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
