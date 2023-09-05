import React, { useEffect, useMemo, useState } from 'react';
import { css } from '@emotion/react';
import { Dialog, DialogTitle } from '@mui/material';

import {
  Autocomplete,
  ButtonStyled,
} from '@eto/eto-ui-components';

const styles = {
  dialog: css`
    .MuiPaper-root {
      background-color: var(--bright-blue-light);
      overflow-y: initial;
    }
  `,
  dialogOuter: css`
    font-family: GTZirkonLight;
    padding: 0 0.5rem 0.5rem;
    width: 400px;
  `,
  dialogTitle: css`
    font-family: GTZirkonRegular;
    text-align: center;
  `,
  dialogContents: css`
    background-color: var(--bright-blue-lightest);
    height: 300px;
  `,
  dialogButtonBar: css`
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;

    button + button {
      margin-left: 0.5rem;
    }
  `,
};

export const splitCustomGroup = (externalValue) => {
  return externalValue
    .split(',')
    .map(e => {
      try {
        return parseInt(e);
      } catch {
        return null
      }
    })
    .filter(e => !!e);
};

const EditCustomCompanyGroupDialog = ({
  companyList,
  customGroup,
  isOpen,
  updateCustomGroup,
  updateIsOpen,
}) => {
  const [groupInternal, setGroupInternal] = useState(() => {
    return splitCustomGroup(customGroup);
  });

  useEffect(
    () => {
      setGroupInternal(splitCustomGroup(customGroup));
    },
    [customGroup]
  );

  const handleApply = () => {
    updateCustomGroup(groupInternal.join(','));
    updateIsOpen(false);
  };

  const handleCancel = () => {
    setGroupInternal(splitCustomGroup(customGroup));
    updateIsOpen(false);
  };

  const companyListOptions = useMemo(
    () => {
      return companyList
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
        .map((company) => {
          return {
            text: company.name,
            val: company.cset_id,
          };
        });
    },
    [companyList]
  );

  return (
    <Dialog
      css={styles.dialog}
      open={isOpen}
      onClose={() => updateIsOpen(false)}
    >
      <DialogTitle css={styles.dialogTitle}>Modify custom company group</DialogTitle>
      <div css={styles.dialogOuter}>
        <div css={styles.dialogContents}>
          <Autocomplete
            inputLabel="Companies in group"
            multiple={true}
            options={companyListOptions}
            selected={groupInternal}
            setSelected={setGroupInternal}
          />
        </div>
        <div css={styles.dialogButtonBar}>
          <ButtonStyled onClick={handleCancel} variant="contained">
            Cancel
          </ButtonStyled>
          <ButtonStyled onClick={handleApply} variant="contained">
            Apply
          </ButtonStyled>
        </div>
      </div>
    </Dialog>
  );
};

export default EditCustomCompanyGroupDialog;
