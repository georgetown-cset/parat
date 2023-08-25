import React from 'react';
import { css } from '@emotion/react';

import { Autocomplete } from '@eto/eto-ui-components';

const styles = {
  headerDropdown: css`
    width: calc(100% - 1rem);

    .MuiFormControl-root {
      width: 100%;
    }
  `,
};

const HeaderDropdown = ({
  label,
  multiple=true,
  options,
  selected,
  setSelected,
}) => {
  // Temp
  const optionsInternal = options ?? [{val: 'a', text: 'a'}, {val: 'b', text: 'b'}];

  return (
    <Autocomplete
      css={styles.headerDropdown}
      inputLabel={label}
      multiple={multiple}
      options={optionsInternal}
      selected={selected}
      setSelected={setSelected}
    />
  );
};

export default HeaderDropdown;
