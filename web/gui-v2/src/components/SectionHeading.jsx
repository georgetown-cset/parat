import React from 'react';
import { css } from '@emotion/react';

const styles = {
  chartTitle: css`
    display: flex;
    font-family: GTZirkonMedium;
    font-size: 24px;
    gap: 0.25em;
    justify-content: center;
    margin-bottom: 0;
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
