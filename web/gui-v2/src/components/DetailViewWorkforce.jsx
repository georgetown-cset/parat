import React from 'react';

import HeaderWithLink from './HeaderWithLink';
import StatBox from './StatBox';
import StatWrapper from './StatWrapper';
import overall from '../static_data/overall_data.json';
import { otherMetricMap } from '../static_data/table_columns';

const DetailViewWorkforce = ({
  data,
}) => {
  const yearSpanText = <>{overall.years[0]} to {overall.years[overall.years.length-1]}</>;

  const otherMetricsWorkforceKeys = ['ai_jobs', 'tt1_jobs'];

  return (
    <>
      <HeaderWithLink title="Workforce" />

      <StatWrapper>
        { otherMetricsWorkforceKeys.map((key) => (
          <StatBox
            description={
              <>
                From {yearSpanText}, {data.name} here is some explanatory text
                describing how they had NUMBER jobs of the specified type
                (#{data.other_metrics[key].rank} rank in PARAT
                {data.in_sandp_500 && <>, #NUMBER in the S&P500</>})
              </>
            }
            key={key}
            label={otherMetricMap[key]}
            value={data.other_metrics[key].total}
          />
        ))}
      </StatWrapper>
    </>
  );
};

export default DetailViewWorkforce;
