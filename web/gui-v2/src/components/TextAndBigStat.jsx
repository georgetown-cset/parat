import React from 'react';
import { css } from '@emotion/react';

const styles = css`
  align-items: center;
  column-gap: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 1rem;

  span {
    font-size: 120%;
    text-align: center;
  }

  big {
    font-family: GTZirkonRegular;
    font-size: 180%;
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
      <span>{smallText}</span>
      <big>{bigText}</big>
    </div>
  );
};

export default TextAndBigStat;
