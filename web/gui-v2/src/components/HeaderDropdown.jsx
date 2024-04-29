import React from 'react';
import { css } from '@emotion/react';

import { Autocomplete } from '@eto/eto-ui-components';

const styles = {
  headerDropdown: css`
    margin: 0;

    .MuiFormControl-root {
      width: 100%;
    }

    .MuiAutocomplete-option {
      padding: 6px;
    }
  `,
};

const HeaderDropdown = ({
  className: appliedClassName,
  css: appliedCss,
  id: appliedId,
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
      className={appliedClassName}
      css={[styles.headerDropdown, appliedCss]}
      getOptionLabel={opt => opt?.text_str ?? opt?.text ?? ""}
      id={appliedId}
      inputLabel={label}
      multiple={multiple}
      options={optionsInternal}
      selected={selected}
      setSelected={setSelected}
      showLabel={false}
    />
  );
};

export default HeaderDropdown;
