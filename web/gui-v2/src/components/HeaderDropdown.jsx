import React from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

const styles = {
  headerDropdown: css`
    --dropdown-width: calc(100% - 1rem);

    .MuiFormControl-root {
      width: var(--dropdown-width, 120px);
    }
  `,
};

const HeaderDropdown = ({
  label,
  options,
  selected,
  setSelected,
}) => {
  // Temp
  const optionsInternal = options ?? [{val: 'a', text: 'a'}, {val: 'b', text: 'b'}];

  return (
    <Dropdown
      css={styles.headerDropdown}
      inputLabel={label}
      options={optionsInternal}
      selected={selected}
      setSelected={setSelected}
    />
  );
};

export default HeaderDropdown;
