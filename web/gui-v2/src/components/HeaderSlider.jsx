import React from 'react';
import { css } from '@emotion/react';
import { Slider } from '@mui/material';

// import { LabelStyled } from '@eto/eto-ui-components';

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    margin: 0.5rem;
    width: 100%;
  `,
  slider: css`
    margin: 0 6px;
    width: calc(100% - 12px);
  `,
};

const HeaderSlider = ({
  label,
  onChange,
  value,
}) => {
  return (
    <div css={styles.wrapper}>
      <label>{label}</label>
      <Slider
        css={styles.slider}
        onChange={onChange}
        size="small"
        value={value}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => val === 100 ? "100+" : val}
      />
    </div>
  );
};

export default HeaderSlider;
