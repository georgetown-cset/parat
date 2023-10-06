import React, { Suspense, lazy } from 'react';
import { css } from '@emotion/react';

import SectionHeading from './SectionHeading';
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
};


const Chart = ({
  config,
  data,
  id,
  layout,
  title,
}) => {
  return (
    !isSSR &&
    <Suspense fallback={<div css={fallback}>Loading graph...</div>}>
      <SectionHeading id={id}>
        {title}
      </SectionHeading>
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
