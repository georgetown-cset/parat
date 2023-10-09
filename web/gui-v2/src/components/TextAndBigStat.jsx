import React from 'react';
import { css } from '@emotion/react';

import { breakpoints } from '@eto/eto-ui-components';

const styles = css`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 1rem;

  ${breakpoints.tablet_regular} {
    flex-direction: row;
  }

  big {
    font-family: GTZirkonRegular;
    font-size: 180%;
    margin-left: 0.5rem;
  }
`;

const TextAndBigStat = ({
  bigText,
  className: appliedClassName,
  css: appliedCss,
  id: appliedId,
  smallText,
}) => {
  return (
    <div
      className={appliedClassName}
      css={[styles, appliedCss]}
      id={appliedId}
    >
      {smallText}
      <big>{bigText}</big>
    </div>
  );
};

export default TextAndBigStat;
