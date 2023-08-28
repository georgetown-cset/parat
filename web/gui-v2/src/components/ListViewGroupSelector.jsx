import React, { useState } from 'react';
import { css } from '@emotion/react';
import { Button } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

import { Dropdown, HelpTooltip } from '@eto/eto-ui-components';

import EditCustomCompanyGroupDialog from './EditCustomCompanyGroupDialog';
import { plausibleEvent } from '../util/analytics';

const styles = {
  groupSelector: css`
    align-items: center;
    background-color: var(--bright-blue-lighter);
    color: var(--dark-blue);
    display: flex;
    font-family: GTZirkonRegular;
    font-size: 120%;
    margin-bottom: 1rem;
    padding: 0.25rem 0.5rem;
  `,
  dropdown: css`
    margin-left: 0.5rem;

    .MuiInput-input.MuiSelect-select {
      align-items: center;
      display: flex;
      padding: 0.25rem;

      &,
      &:focus {
        background-color: var(--bright-blue-lighter);
      }
    }
  `,
  editCustomGroupButton: css`
    font-family: GTZirkonLight;

    svg {
      margin-right: 5px;
    }
  `,
};

export const NO_SELECTED_GROUP = '--';
export const USER_CUSTOM_GROUP = 'custom';

const GroupSelector = ({
  companyList,
  customGroup,
  groupsList,
  selectedGroup,
  updateSelectedGroup,
  updateCustomGroup,
}) => {
  const [isCustomGroupDialogOpen, setIsCustomGroupDialogOpen] = useState(false);
  const groupsOptions = [
    { text: 'All companies', val: NO_SELECTED_GROUP },
    ...Object.keys(groupsList).map(groupName => ({ text: groupName, val: groupName })),
    { text: 'User-defined', val: USER_CUSTOM_GROUP },
  ];

  return (
    <div css={styles.groupSelector} data-testid="group-selector">
      <span>Select a group for comparison:</span>
      <HelpTooltip
        text="TOOLTIP GOES HERE EXPLAINING GROUPS"
      />
      <Dropdown
        css={styles.dropdown}
        inputLabel="Group"
        options={groupsOptions}
        selected={selectedGroup}
        setSelected={(newVal) => {
          plausibleEvent('Select company group', { group: newVal });
          updateSelectedGroup(newVal);
        }}
        showLabel={false}
      />
      {selectedGroup === USER_CUSTOM_GROUP &&
        <Button
          css={styles.editCustomGroupButton}
          onClick={() => setIsCustomGroupDialogOpen(true)}
        >
          <ConstructionIcon />
          Edit custom group
        </Button>
      }
      <EditCustomCompanyGroupDialog
        companyList={companyList}
        customGroup={customGroup}
        isOpen={isCustomGroupDialogOpen}
        updateCustomGroup={updateCustomGroup}
        updateIsOpen={setIsCustomGroupDialogOpen}
      />
    </div>
  );
};

export default GroupSelector;
