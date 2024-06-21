import React, { Fragment, useEffect, useState } from 'react';
import { css } from '@emotion/react';
import {
  Checkbox,
  Dialog,
  DialogTitle,
} from '@mui/material';

import { ButtonStyled, HelpTooltip } from '@eto/eto-ui-components';
import columnDefinitions, { columnsByCategory } from '../static_data/table_columns';
import { plausibleEvent } from '../util/analytics';


const styles = {
  columnDialog: css`
    .MuiPaper-root {
      background-color: var(--bright-blue-light);
    }
  `,
  columnDialogContents: css`
    font-family: GTZirkonLight;
    padding: 0 0.5rem 0.5rem;
    width: 420px;
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

    h3, h4 {
      color: var(--bright-blue);
      margin-bottom: 0;
      margin-left: 0.5rem;
    }
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
    align-items: center;
    color: initial;
    display: flex;
    font-family: GTZirkonLight;
    font-size: initial;
    text-transform: initial;
  `,
};

const generateColumnState = (selected, defs) => {
  const split = selected.split(',');
  return Object.fromEntries(defs.map(e => [e.key, split.includes(e.key)]));
}

const COLUMN_GROUPINGS = [
  { heading: "Basic info", entries: columnsByCategory.basic },
  { heading: "Publications", entries: columnsByCategory.publications },
  {
    heading: "Patents",
    entries: columnsByCategory.patents,
    subgroups: [
      { heading: "Patents: AI use cases", entries: columnsByCategory["patents:use-cases"] },
      { heading: "Patents: AI applications and techniques", entries: columnsByCategory["patents:applications"] },
    ],
  },
  { heading: "Workforce", entries: columnsByCategory.workforce },
];


const ColumnSelectionListEntry = ({
  colDef,
  columnsInternal,
  setColumnsInternal,
}) => (
  <label css={styles.plainLabel} key={colDef.key} aria-label={colDef.title}>
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
    {colDef?.tooltip && <HelpTooltip smallIcon={true} text={colDef.tooltip} />}
  </label>
);


const AddRemoveColumnDialog = ({
  isOpen,
  selectedColumns,
  updateIsOpen,
  updateSelectedColumns,
}) => {
  const [columnsInternal, setColumnsInternal] = useState(() => {
    return generateColumnState(selectedColumns, columnDefinitions);
  });

  useEffect(
    () => {
      setColumnsInternal(generateColumnState(selectedColumns, columnDefinitions));
    },
    [selectedColumns]
  );

  const handleCancel = () => {
    updateIsOpen(false);
  };

  const handleApply = () => {
    const columns = Object.entries(columnsInternal)
      .filter(e => e[1])
      .map(e => e[0])
      .join(',');

    if ( columns !== selectedColumns ) {
      plausibleEvent('Update selected columns', { columns });
      updateSelectedColumns(columns);
    }
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
            COLUMN_GROUPINGS.map((colGroup, ix) => (
              <Fragment key={ix}>
                <h3>{colGroup.heading}</h3>
                {colGroup.entries &&
                  colGroup.entries.map((entry, ix) => (
                    <ColumnSelectionListEntry
                      colDef={entry}
                      columnsInternal={columnsInternal}
                      key={ix}
                      setColumnsInternal={setColumnsInternal}
                    />
                  ))
                }
                {colGroup.subgroups &&
                  colGroup.subgroups.map((subgroup, ix) => (
                    <Fragment key={ix}>
                      <h4>{subgroup.heading}</h4>
                      {subgroup.entries.map((entry, ix) => (
                        <ColumnSelectionListEntry
                          colDef={entry}
                          columnsInternal={columnsInternal}
                          key={ix}
                          setColumnsInternal={setColumnsInternal}
                        />
                      ))}
                    </Fragment>
                  ))
                }
              </Fragment>
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
