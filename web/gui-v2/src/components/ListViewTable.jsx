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


const getDataList = (data, filters, key) => {
  if ( filters[key] === null ){
    return [...new Set(data.map(company => company[key]).filter(c => c !== null))].sort()
  }
  return [...new Set(filters[key])].sort();
};

const listToDropdownOptions = (list) => {
  return list.map(o => ({val: o, text: o}));
}

const dropdownParamToArray = (str) => {
  return str
    .split(',')
    .filter(e => e !== "");
}



const ListViewTable = ({
  data,
  filteredFilters,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [windowSize, setWindowSize] = useState(800);


  // Testing an alternate state management concept
  const testState = {
    foo: useState(false),
    count: useState(0),
    param: useQueryParamString('test', 0),
  };
  const testFilters = Object.fromEntries(
    Object.keys(testState)
      .map((key) => {
        return [
          key,
          {
            get get() { return testState[key][0] },
            set: (newVal) => testState[key][1](newVal),
          }
        ];
      })
  );

  // Alternate method of accessing the state values, storing the useState-equivalents
  // directly into an object (and then remapping to create user-friendlier keys).
  const filterStore = {
    name: useQueryParamString('name', ''),
    country: useQueryParamString('country', ''),
    continent: useQueryParamString('continent', ''),
    stage: useQueryParamString('stage', ''),
    // ...
    ai_pubs: useQueryParamString('ai_pubs', '0,100'),
    ai_patents: useQueryParamString('ai_patents', '0,100'),
  };
  const altFilters = Object.fromEntries(
    Object.keys(filterStore).map(k => [k, {
      get get() { return filterStore[k][0].split(',').filter(e => e !== "") },
      set: (newVal) => filterStore[k][1](newVal.join(',')),
    }])
  );


  // Filter state, stored in URL parameters
  const [nameParam, setNameParam] = useQueryParamString('name', '');
  const [countryParam, setCountryParam] = useQueryParamString('country', '');
  const [continent, setContinentParam, continentParamInitialized, clearContinentParam] = useQueryParamString('continent', '');
  const [stageParam, setStageParam, stageParamInitialized, clearStageParam] = useQueryParamString('stage', '');
  // ...
  const [aiPubsParam, setAiPubsParam] = useQueryParamString('ai_pubs', '0,100');
  const [aiPatentsParam, setAiPatentsParam] = useQueryParamString('ai_patents', '0,100');

  // Common interface for all filters so that they can be programmatically
  // accessed via their keys (via this object) and the filter state is handled
  // via `useQueryParamString` and URL parameters.
  const filters = {
    name: {
      get get() { return dropdownParamToArray(nameParam) },
      set: (newVal) => setNameParam(newVal.join(',')),
    },
    country: {
      get get() { return dropdownParamToArray(countryParam) },
      set: (newVal) => setCountryParam(newVal.join(',')),
    },
    continent: {
      get get() { return dropdownParamToArray(continent) },
      set: (newVal) => setContinentParam(newVal.join(',')),
    },
    stage: {
      get get() { return dropdownParamToArray(stageParam) },
      set: (newVal) => setStageParam(newVal.join(',')),
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


  useEffect(() => {
    const handleResize = () => setWindowSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
  });

  const handleDropdownChange = (columnKey, newVal) => {
    console.info(`dropdown changed for ${columnKey}: `, newVal); // DEBUG
    if ( ! Array.isArray(newVal) ) {
      newVal = [newVal];
    }

    if ( filters?.[columnKey] ) {
      filters[columnKey].set(newVal);
    }
  };

  const handleSliderChange = (columnKey, newVal) => {
    console.info(`slider changed for ${columnKey}: `, newVal); // DEBUG

    if ( filters?.[columnKey] ) {
      filters[columnKey].set(newVal);
    }
  };


  // const filteredFilters = {
  //   "name": null,
  //   "country": null,
  //   "continent": null,
  //   "stage": null
  // };

  const companies = useMemo(
    () => getDataList(data, filteredFilters, 'name'),
    [data]
  );

  const countries = useMemo(
    () => getDataList(data, filteredFilters, 'country'),
    [data]
  );

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
      name: listToDropdownOptions(companies),
      country: listToDropdownOptions(countries),
      continent: listToDropdownOptions(continents),
      stage: listToDropdownOptions(stages),
    }),
    [continents, stages]
  );
  // console.info("filterOptions:", filterOptions);


  const columns = columnDefinitions
    .filter(colDef => colDef?.initialCol)
    .map((colDef) => {
      const column = {
        display_name: (colDef.type === 'dropdown' ?
          <HeaderDropdown
            label={colDef.title}
            options={filterOptions?.[colDef.key]}
            selected={filters?.[colDef.key].get}
            setSelected={newVal => handleDropdownChange(colDef.key, newVal)}
          />
        :
          <HeaderSlider
            label={colDef.title}
            onChange={newVal => handleSliderChange(colDef.key, newVal)}
            value={filters?.[colDef.key].get}
          />
        ),
        key: colDef.key,
        sortable: colDef.sortable,
        css: colDef.type === 'slider' && css`width: 120px;`,
      };
      if ( colDef?.format ) {
        column.format = colDef.format;
      }
      return column;
    });

  const colDefIndices = {};
  columnDefinitions.forEach((def, ix) => {
    colDefIndices[def.key] = ix;
  });


  const tableSortComparator = (a, b, key) => {
    const colDef = columnDefinitions[colDefIndices[key]];
    const aVal = colDef?.extract ? colDef.extract(a[key]) : a[key];
    const bVal = colDef?.extract ? colDef.extract(b[key]) : b[key];

    const aIsUndef = aVal === null || aVal === undefined;
    const bIsUndef = bVal === null || bVal === undefined;

    if ( aIsUndef && bIsUndef ) {
      return 0;
    } else if ( aIsUndef ) {
      return 1;
    } else if ( bIsUndef ) {
      return -1;
    } else if ( bVal < aVal ) {
      return -1;
    } else if ( aVal < bVal ) {
      return 1;
    } else {
      return 0;
    }
  };

  const resetFilters = () => {
    columnDefinitions.forEach((colDef) => {
      if ( colDef.type === "dropdown" ) {
        filters[colDef.key]?.set([]);
      } else if ( colDef.type === "slider" ) {
        filters[colDef.key]?.set([0, 100]);
      }
    });
  };


  // Aggregate some of the data that aren't (yet) available in the raw sources
  // const dataForTable = data.slice(0, 16).map((entry) => ({
  //   ...entry,
  //   aggregate_ai_publications: entry.yearly_ai_publications.reduce((a, b) => a+b, 0),
  //   aggregate_ai_patents: entry.yearly_ai_patents.reduce((a, b) => a+b, 0),
  // }));

  const filterKeys = Object.keys(filters);
  const dataForTable = data
    .filter((elem) => {
      for ( const colDef of columnDefinitions ) {
        if ( !filterKeys.includes(colDef.key) ) {
          continue;
        }

        const elemVal = colDef?.extract?.(elem[colDef.key]) ?? elem[colDef.key];

        if ( colDef.type === "dropdown" ) {
          if ( filters?.[colDef.key].get.length > 0 ) {
            if ( ! filters?.[colDef.key].get.includes(elemVal) ) {
              return false;
            }
          }
        } else if ( colDef.type === "slider" ) {
          if ( filters?.[colDef.key].get.length !== 2 ) {
            console.error(`Invalid filter value for range filter '${colDef.key}': expecting [min, max], got ${JSON.stringify(filters?.[colDef.key].get)}`);
            continue;
          }

          const [min, max] = filters[colDef.key].get;
          if ( elemVal < min || ( max < 100 && max < elemVal) ) {
            return false;
          }
        } else {
          console.error(`Invalid column type for key '${colDef.key}': column.type should be either "dropdown" or "slider" but is instead "${colDef.type}"`);
        }
      }

      return true;
    });


  return (
    <div className="list-view-table" data-testid="list-view-table">
      {/* TESTING ELEMENTS */}
      <div style={{backgroundColor: "lightgreen", padding: 4}}>
        <button onClick={() => testState.foo[1](!testState.foo[0])}>
          bool: {`${testState.foo[0]}`}
        </button>
        <button onClick={() => testState.count[1](v => v+1)}>
          int state: {testState.count[0]}
        </button>
        <button onClick={() => testState.param[1](parseInt(testState.param[0])+1)}>
          URL param: {testState.param[0]}
        </button>
      </div>

      {/* TESTING ELEMENTS */}
      <div style={{backgroundColor: "salmon", padding: 4}}>
        <button onClick={() => testFilters.foo.set(!testFilters.foo.get)}>
          bool: {`${testFilters.foo.get}`}
        </button>
        <button onClick={() => testFilters.count.set(v => v+1)}>
          int state: {testFilters.count.get}
        </button>
        <button onClick={() => testFilters.param.set(parseInt(testFilters.param.get)+1)}>
          URL param: {testFilters.param.get}
        </button>
      </div>

      {/* TESTING ELEMENTS */}
      <div style={{backgroundColor: "lightblue", padding: 4}}>
        <Dropdown
          inputLabel="Stage"
          multiple={true}
          options={filterOptions.stage}
          selected={altFilters.stage.get}
          setSelected={(newVal) => {
            if ( ! Array.isArray(newVal) ) {
              newVal = [newVal];
            }
            altFilters.stage.set(newVal);
          }}
        />
      </div>

      <div css={styles.buttonBar}>
        <div>
          <Button
            css={styles.buttonBarButton}
            onClick={resetFilters}
          >
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
        columns={columns}
        css={styles.table}
        cutoff={100}
        data={dataForTable}
        sortComparator={tableSortComparator}
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
