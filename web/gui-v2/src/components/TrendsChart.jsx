import React from 'react';
import { css } from '@emotion/react';

import Chart from './DetailViewChart';

const styles = {
  chartWrapper: css`
    h3 {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin: 0 auto;
      width: fit-content;

      .dropdown .MuiFormControl-root {
        margin: 0;
        margin-left: 0.5rem;
      }
    }
  `,
};

const TrendsChart = ({
  className: appliedClassName,
  css: appliedCss,
  id: appliedId,
  title,
  ...otherProps
}) => {
  return (
    <div
      className={appliedClassName}
      css={[styles.sectionMargin, styles.sectionWithHeading, styles.chartWrapper, appliedCss]}
      id={appliedId}
    >
      <Chart
        {...otherProps}
        id={appliedId}
        title={title}
      />
    </div>
  );
};

export default TrendsChart;
