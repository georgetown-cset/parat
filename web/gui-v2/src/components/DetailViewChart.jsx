import React, { Suspense, lazy } from 'react';
import { css } from '@emotion/react';

import { fallback } from '../styles/common-styles';

const Plot = lazy(() => import('react-plotly.js'));

const isSSR = typeof window === "undefined";

const styles = {
  chartContainer: css`
    /* aspect-ratio: 4 / 3; */
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    margin: 0.5rem auto 0;
    max-width: 1000px;
  `,
  chartTitle: css`
    font-family: GTZirkonMedium;
    font-size: 24px;
    margin-bottom: 0;
    text-align: center;
  `,
};


const Chart = ({
  config,
  data,
  layout,
  title,
}) => {
  return (
    !isSSR &&
    <Suspense fallback={<div css={fallback}>Loading graph...</div>}>
      <h3 css={styles.chartTitle}>
        {title}
      </h3>
      <div css={styles.chartContainer}>
        <Plot
          data={data}
          layout={layout}
          config={config}
        />
      </div>
    </Suspense>
  );
};

export default Chart;
