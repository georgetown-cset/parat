import React from 'react';
import { css } from '@emotion/react';

const styles = {
  statWrapper: css`
    display: flex;
    justify-content: space-around;
    margin: 1rem auto;
    max-width: 720px;
  `,
};

const StatWrapper = ({
  children,
}) => {


  return (
    <div css={styles.statWrapper}>
      {children}
    </div>
  );
};

export default StatWrapper;
