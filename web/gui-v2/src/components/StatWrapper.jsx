import React from 'react';
import { css } from '@emotion/react';

const styles = {
  statWrapper: css`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    justify-content: space-around;
    margin: 2rem auto;
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
