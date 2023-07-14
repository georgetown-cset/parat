import React, { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { Slider } from '@mui/material';

import { debounce } from '../util';

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
  const [valueInternal, setValueInternal] = useState(value);

  // Update internal value based on external changes
  useEffect(
    () => setValueInternal(value),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(value)]
  );

  // Debounce handler for propagating internal changes to the outside
  const externalHandler = (newVal) => onChange(newVal);
  const handleExternalChange = useMemo(() => {
    return debounce(externalHandler, 300);
  }, []);

  // Trigger external state change
  useEffect(
    () => handleExternalChange(valueInternal),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(valueInternal)]
  );

  return (
    <div css={styles.wrapper}>
      <label>{label}</label>
      <Slider
        css={styles.slider}
        onChange={(newVal) => setValueInternal(newVal.target.value)}
        size="small"
        value={valueInternal}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => val === 100 ? "100+" : val}
      />
    </div>
  );
};

export default HeaderSlider;
