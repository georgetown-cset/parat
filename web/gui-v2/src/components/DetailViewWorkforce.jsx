import React from 'react';
import { css } from '@emotion/react';

import { Alert, ExternalLink } from '@eto/eto-ui-components';

import HeaderWithLink from './HeaderWithLink';
import StatBox from './StatBox';
import StatWrapper from './StatWrapper';
import overall from '../static_data/overall_data.json';
import { otherMetricMap } from '../static_data/table_columns';
import { commas } from '../util';

const styles = {
  nonUScountryAlert: css`
    margin: 0 auto;
    max-width: 700px;
  `,
};

const DetailViewWorkforce = ({
  data,
}) => {

  const otherMetricsWorkforce = [
    {
      key: 'ai_jobs',
      description: (
        <span>
          According to our data, {data.name} currently employs about {commas(data.other_metrics.ai_jobs.total)} AI workers
          (#{data.other_metrics.ai_jobs.rank} rank in PARAT
          {data.groups.sp500 && <>, #{data.other_metrics.ai_jobs.sp500_rank} in the S&P500</>}). <em>AI workers in PARAT include anyone a high probability of working with AI. Recent hires may be omitted. <ExternalLink href="https://eto.tech/dataset-docs/private-sector-ai-indicators/#workforce">Read more &gt;&gt;</ExternalLink></em>
        </span>
      ),
    },
    {
      key: 'tt1_jobs',
      description: (
        <span>
          According to our data, {data.name} currently employs about {commas(data.other_metrics.tt1_jobs.total)} Tech Tier 1 workers
          (#{data.other_metrics.tt1_jobs.rank} rank in PARAT
          {data.groups.sp500 && <>, #{data.other_metrics.tt1_jobs.sp500_rank} in the S&P500</>}).
          <em>Tech Tier 1 workers include anyone with technical skills and a reasonable probability of working with AI. Recent hires may be omitted. <ExternalLink href="https://eto.tech/dataset-docs/private-sector-ai-indicators/#workforce">Read more &gt;&gt;</ExternalLink></em>
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
