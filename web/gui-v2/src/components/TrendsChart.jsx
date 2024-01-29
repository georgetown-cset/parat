import React, { Suspense, lazy } from 'react';
import { css } from '@emotion/react';

import { breakpoints } from '@eto/eto-ui-components';

import SectionHeading from './SectionHeading';
import { fallback } from '../styles/common-styles';
import { cleanFalse } from '../util';
import { assemblePlotlyParams } from '../util/plotly-helpers';

const Plot = lazy(() => import('react-plotly.js'));

const isSSR = typeof window === "undefined";

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
  chartContainer: css`
    /* aspect-ratio: 4 / 3; */
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    margin: 0.5rem auto 0;
    max-width: 1000px;

    .plotly.plot-container {
      height: 450px;
    }
  `,
};

/**
 * Chart and heading showing trends over time.
 *
 * @param {object} props
 * @param {Array<[string, Array<number>]>} props.data
 * @param {object} props.layoutChanges
 * @param {boolean|undefined} props.partialStartIndex
 * @param {string} props.title
 * @param {Array<number>} props.years
 * @returns {JSX.Element}
 */
const TrendsChart = ({
  className: appliedClassName,
  css: appliedCss,
  data: dataRaw,
  id: appliedId,
  layoutChanges,
  partialStartIndex=undefined,
  title,
  years,
}) => {
  const { config, data, layout } = assemblePlotlyParams(years, cleanFalse(dataRaw), layoutChanges, { partialStartIndex });

  return (
    <div
      className={appliedClassName}
      css={[styles.sectionMargin, styles.sectionWithHeading, styles.chartWrapper, appliedCss]}
      id={appliedId}
    >
      {!isSSR &&
        <Suspense fallback={<div css={fallback}>Loading graph...</div>}>
          <SectionHeading id={appliedId}>
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
      }
    </div>
  );
};

export default TrendsChart;
