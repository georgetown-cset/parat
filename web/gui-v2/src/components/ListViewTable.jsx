import React, { useEffect, useMemo, useState } from 'react';
import { useQueryParamString } from 'react-use-query-param-string';
import { css } from '@emotion/react';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogTitle,
} from '@mui/material';

import {
  ButtonStyled,
  Dropdown,
  Table,
  TextFieldStyled,
  classes,
} from '@eto/eto-ui-components';

import HeaderDropdown from './HeaderDropdown';
import HeaderSlider from './HeaderSlider';
import columnDefinitions from '../static_data/table_columns';
import { srOnly } from '../accessibility';

const styles = {
  buttonBar: css`
    background-color: var(--bright-blue-lighter);
    display: flex;
    padding: 0.5rem;

    button {
      font-family: GTZirkonLight;

      svg {
        margin-right: 5px;
      }
    }
  `,
  buttonBarRight: css`
    margin-left: auto;
  `,
  buttonBarButton: css`
    min-width: 40px;
  `,
  columnDialog: css`
    font-family: GTZirkonLight;
    padding: 0.5rem;

  `,
  columnDialogTitle: css`
    font-family: GTZirkonRegular;
  `,
  columnDialogBottom: css`
    display: flex;
    justify-content: center;
  `,
  table: css`
    td.MuiTableCell-root {
      padding: 0.5rem;
    }
    th.MuiTableCell-root {
      padding: 0;
    }

    th .MuiButtonBase-root {
      width: 100%;

      & > span {
        width: 100%;
      }
    }
  `,
};

// Internal value for unfiltered dropdowns (i.e. any value)
const DROPDOWN_ANY = "-";


const getDataList = (data, filters, key) => {
  if ( filters[key] === null ){
    return [...new Set(data.map(company => company[key]).filter(c => c !== null))].sort()
  }
  return [...new Set(filters[key])].sort();
};

const listToDropdownOptions = (list) => {
  return [
    { val: DROPDOWN_ANY, text: '--any--' },
    ...list.map(o => ({val: o, text: o}))
  ];
}


const ListViewTable = ({
  data,
  filteredFilters,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [windowSize, setWindowSize] = useState(800);

  // Filter state, stored in URL parameters
  const [regionParam, setRegionParam, regionParamInitialized, clearRegionParam] = useQueryParamString('region', DROPDOWN_ANY);
  const [stageParam, setStageParam, stageParamInitialized, clearStageParam] = useQueryParamString('stage', DROPDOWN_ANY);
  // ...
  const [aiPubsParam, setAiPubsParam] = useQueryParamString('ai_pubs', '0,10000');
  const [aiPatentsParam, setAiPatentsParam] = useQueryParamString('ai_patents', '0,100');

  // Common interface for all filters so that they can be programmatically
  // accessed via their keys (via this object) and the filter state is handled
  // via `useQueryParamString` and URL parameters.
  const filters = {
    region: {
      get get() { return regionParam },
      set: (newVal) => setRegionParam(newVal),
    },
    stage: {
      get get() { return stageParam },
      set: (newVal) => setStageParam(newVal),
    },
    // ...
    ai_pubs: {
      get get() { return aiPubsParam.split(',').map(v => parseInt(v)) },
      set: (newVal) => setAiPubsParam(newVal.join(',')),
    },
    ai_patents: {
      get get() { return aiPatentsParam.split(',').map(v => parseInt(v)) },
      set: (newVal) => setAiPatentsParam(newVal.join(',')),
    },
  }

  console.info("Filters object:", filters); // DEBUG
  console.info("  - ai_pubs:", filters.ai_pubs.get);
  console.info("  - ai_patents:", filters.ai_patents.get);


  const activeFilters = useMemo(
    () => {
      const filterEntries = Object.entries(filters);
      const active = {};


      console.info("active filters:", active);
      return active;
    },
    [filters]
  );


  useEffect(() => {
    const handleResize = () => setWindowSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
  });


  const handleSliderChange = (columnKey, newVal) => {
    console.info(`slider changed for ${columnKey}: `, newVal); // DEBUG

    if ( filters?.[columnKey] ) {
      console.info(">> setting new value:", newVal);
      filters[columnKey].set(newVal);
    }
  };


  // const filteredFilters = {
  //   "name": null,
  //   "country": null,
  //   "continent": null,
  //   "stage": null
  // };

  const continents = useMemo(
    () => getDataList(data, filteredFilters, 'continent'),
    [data]
  );

  const stages = useMemo(
    () => getDataList(data, filteredFilters, 'stage'),
    [data]
  );

  const filterOptions = useMemo(
    () => ({
      continent: listToDropdownOptions(continents),
      stage: listToDropdownOptions(stages),
    }),
    [continents, stages]
  );
  console.info("filterOptions:", filterOptions);



  const columns = columnDefinitions
    .filter(colDef => colDef?.initialCol)
    .map((colDef) => {
      const column = {
        display_name: (colDef.type === 'dropdown' ?
          <HeaderDropdown
            label={colDef.title}
            options={filterOptions?.[colDef.key]}
          />
        :
          <HeaderSlider
            label={colDef.title}
            onChange={(newVal) => handleSliderChange(colDef.key, newVal.target.value)}
            value={filters?.[colDef.key].get}
          />
        ),
        key: colDef.key,
        sortable: colDef.sortable,
      };
      if ( colDef?.format ) {
        column.format = colDef.format;
      }
      return column;
    });
  console.info("columns:", columns); // DEBUG


  // Aggregate some of the data that aren't (yet) available in the raw sources
  const dataForTable = data.slice(0, 16).map((entry) => ({
    ...entry,
    aggregate_ai_publications: entry.yearly_ai_publications.reduce((a, b) => a+b, 0),
    aggregate_ai_patents: entry.yearly_ai_patents.reduce((a, b) => a+b, 0),
  }));

  return (
    <div className="list-view-table" data-testid="list-view-table">
      <div css={styles.buttonBar}>
        <div>
          <Button css={styles.buttonBarButton}>
            <CloseIcon />
            <span className={classes([windowSize < 300 && "sr-only"])}>
              Reset filters
            </span>
          </Button>
        </div>
        <div css={styles.buttonBarRight}>
          {/* TODO: enable once downloads are possible */}
          <Button css={styles.buttonBarButton} disabled>
            <DownloadIcon />
            <span className={classes([windowSize < 600 && "sr-only"])}>
              Download results
            </span>
          </Button>
          <Button css={styles.buttonBarButton} onClick={() => setDialogOpen(true)}>
            <AddCircleOutlineIcon />
            <span className={classes([windowSize < 500 && "sr-only"])}>
              Add/remove columns
            </span>
          </Button>
        </div>
      </div>
      <Table
        css={styles.table}
        columns={columns}
        data={dataForTable}
      />
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle css={styles.columnDialogTitle}>Add/remove columns</DialogTitle>
        <div css={styles.columnDialog}>
          {}
          <div css={styles.columnDialogBottom}>
            <ButtonStyled onClick={() => setDialogOpen(false)} variant="contained">
              Close
            </ButtonStyled>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ListViewTable;
