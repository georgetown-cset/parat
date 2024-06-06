import React from 'react';
import { css } from '@emotion/react';

const styles = {
  chartTitle: css`
    flex-wrap: nowrap;
    font-family: GTZirkonMedium;
    font-size: 24px;
    margin-bottom: 0;
    text-align: center;

    .helptooltip {
      margin-top: -4px;
      vertical-align: middle;
    }
  `,
};

const SectionHeading = ({ children, id }) => {
  return (
    <h3 css={styles.chartTitle} id={id}>
      {children}
    </h3>
  );
};

export default SectionHeading;
