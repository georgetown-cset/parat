import React from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

const styles = {
  groupSelector: css`
    background-color: var(--bright-blue-lighter);
    color: var(--dark-blue);
    display: flex;
    font-family: GTZirkonRegular;
    font-size: 120%;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
  `,
};

const GroupSelector = ({
  groupsList,
  selectedGroup,
  setSelectedGroup,
}) => {
  const groupsOptions = [
    { text: '--any group--', val: '--' },
    ...Object.keys(groupsList).map(groupName => ({ text: groupName, val: groupName })),
  ];

  return (
    <div css={styles.groupSelector}>
      <span>Select a group for comparison:</span>
      <Dropdown
        inputLabel="Group"
        options={groupsOptions}
        selected={selectedGroup}
        setSelected={setSelectedGroup}
      />
    </div>
  );
};

export default GroupSelector;
