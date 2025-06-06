import React, { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { Slider } from '@mui/material';

import { debounce } from '../util';
import { parseSlider } from '../util/list-filters';

const styles = {
  wrapper: css`
    display: flex;
    flex-direction: column;
    width: 100%;
  `,
  slider: css`
    margin: 0 6px;
    width: calc(100% - 12px);

    .MuiSlider-thumb {
      height: 10px;
      width: 10px;
    }

    .MuiSlider-valueLabel {
      font-family: GTZirkonLight;
    }
  `,
};

const HeaderSlider = ({
  initialValue,
  label,
  max=100,
  min=0,
  onChange,
  value,
}) => {
  const [valueInternal, setValueInternal] = useState(() => parseSlider(initialValue) ?? value);

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
      <Slider
        css={styles.slider}
        getAriaLabel={(index) => index === 0 ? "Lower bound" : "Upper bound"}
        min={min}
        max={max}
        onChange={(newVal) => setValueInternal(newVal.target.value)}
        onClick={(event) => event.stopPropagation()}
        size="small"
        value={valueInternal}
        valueLabelDisplay="auto"
        valueLabelFormat={(val) => val === max ? `≥ ${max}` : (val===min && min < 0 ? `≤ ${min}` : val)}
      />
    </div>
  );
};

export default HeaderSlider;
