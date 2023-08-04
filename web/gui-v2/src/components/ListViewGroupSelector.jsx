import React from 'react';
import { css } from '@emotion/react';

import { Dropdown, HelpTooltip } from '@eto/eto-ui-components';

const styles = {
  groupSelector: css`
    align-items: center;
    background-color: var(--bright-blue-lighter);
    color: var(--dark-blue);
    display: flex;
    font-family: GTZirkonRegular;
    font-size: 120%;
    margin-bottom: 1rem;
    padding: 0.25rem 1rem;
  `,
  dropdown: css`
    margin-left: 0.5rem;
  `,
};

export const NO_SELECTED_GROUP = '--';

const GroupSelector = ({
  groupsList,
  selectedGroup,
  setSelectedGroup,
}) => {
  const groupsOptions = [
    { text: '--any group--', val: NO_SELECTED_GROUP },
    ...Object.keys(groupsList).map(groupName => ({ text: groupName, val: groupName })),
  ];

  return (
    <div css={styles.groupSelector}>
      <span>Select a group for comparison:</span>
      <Dropdown
        css={styles.dropdown}
        inputLabel="Group"
        options={groupsOptions}
        selected={selectedGroup}
        setSelected={setSelectedGroup}
        showLabel={false}
      />
      <HelpTooltip
        text="TOOLTIP GOES HERE EXPLAINING GROUPS"
      />
    </div>
  );
};

export default GroupSelector;
