import React from 'react';

import HeaderWithLink from './HeaderWithLink';
import StatBox from './StatBox';
import StatWrapper from './StatWrapper';

const DetailViewWorkforce = ({
  data,
}) => {
  const yearSpanText = <>{data.years[0]} to {data.years[data.years.length-1]}</>;

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
            label={data.other_metrics[key].name}
            value={data.other_metrics[key].total}
          />
        ))}
      </StatWrapper>
    </>
  );
};

export default DetailViewWorkforce;
