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
    column-gap: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    font-family: GTZirkonRegular;
    font-size: 120%;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;

    .group-selector-label,
    .group-selector-controls {
      display: flex;
    }

    .group-selector-label {
      padding: 3.25px 0;
    }

    .group-selector-controls {
      column-gap: 0.5rem;

      .dropdown .MuiFormControl-root {
        margin: 0;
      }
    }
  `,
  groupSelectorSection: css`
    display: flex;
  `,
  dropdown: css`
    .MuiFormControl-root {
      margin: 0.5rem 0;
      width: 200px;
    }

    .MuiInput-input.MuiSelect-select {
      align-items: center;
      display: flex;

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
    { text: 'Custom', val: USER_CUSTOM_GROUP },
  ];

  return (
    <div css={styles.groupSelector} data-testid="group-selector">
      <div className="group-selector-label group-selector-label" css={styles.groupSelectorSection}>
        <span>Select a group for comparison:</span>
        <HelpTooltip
          text="TOOLTIP GOES HERE EXPLAINING GROUPS"
        />
      </div>
      <div className="group-selector-controls" css={styles.groupSelectorSection}>
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
      </div>
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
