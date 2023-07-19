import React, { useState } from 'react';
import { css } from '@emotion/react';
import {
  Checkbox,
  Dialog,
  DialogTitle,
} from '@mui/material';

import { ButtonStyled } from '@eto/eto-ui-components';


const styles = {
  columnDialog: css`
    .MuiPaper-root {
      background-color: var(--bright-blue-light);
    }
  `,
  columnDialogContents: css`
    font-family: GTZirkonLight;
    padding: 0 0.5rem 0.5rem;
    width: 320px;
  `,
  columnDialogTitle: css`
    font-family: GTZirkonRegular;
    text-align: center;
  `,
  columnDialogList: css`
    background-color: var(--bright-blue-lightest);
    display: flex;
    flex-direction: column;
    height: calc(100vh - 300px);
    overflow-y: auto;
    transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  `,
  columnDialogBottom: css`
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;

    button + button {
      margin-left: 0.5rem;
    }
  `,
  plainLabel: css`
    color: initial;
    font-family: GTZirkonLight;
    font-size: initial;
    text-transform: initial;
  `,
};

const AddRemoveColumnDialog = ({
  columnDefinitions,
  isOpen,
  selectedColumns,
  updateIsOpen,
  updateSelectedColumns,
}) => {
  const [columnsInternal, setColumnsInternal] = useState(() => {
    const split = selectedColumns.split(',');
    return Object.fromEntries(columnDefinitions.map(e => [e.key, split.includes(e.key)]));
  });

  const handleCancel = () => {
    updateIsOpen(false);
  };

  const handleApply = () => {
    const result = Object.entries(columnsInternal)
      .filter(e => e[1])
      .map(e => e[0]);

    updateSelectedColumns(result.join(','));
    updateIsOpen(false);
  };

  return (
    <Dialog
      css={styles.columnDialog}
      open={isOpen}
      onClose={() => updateIsOpen(false)}
    >
      <DialogTitle css={styles.columnDialogTitle}>Add/remove columns</DialogTitle>
      <div css={styles.columnDialogContents}>
        <div css={styles.columnDialogList}>
          {
            columnDefinitions.map((colDef) => (
              <label css={styles.plainLabel} key={colDef.key}>
                <Checkbox
                  checked={columnsInternal[colDef.key]}
                  onChange={(evt) => {
                    setColumnsInternal({
                      ...columnsInternal,
                      [colDef.key]: evt.target.checked,
                    })
                  }}
                  disabled={colDef.key === "name"}
                />
                {colDef.title}
              </label>
            ))
          }
        </div>
        <div css={styles.columnDialogBottom}>
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

export default AddRemoveColumnDialog;
