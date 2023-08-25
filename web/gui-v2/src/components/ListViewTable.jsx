import React, { useMemo, useState } from 'react';
import { useQueryParamString } from 'react-use-query-param-string';
import { css } from '@emotion/react';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import {
  Button,
  Typography,
} from '@mui/material';

import {
  Table,
  classes,
} from '@eto/eto-ui-components';

import AddRemoveColumnDialog from './AddRemoveColumnDialog';
import HeaderDropdown from './HeaderDropdown';
import HeaderSlider from './HeaderSlider';
import GroupSelector, { NO_SELECTED_GROUP } from './ListViewGroupSelector';
import groupsList from '../static_data/groups';
import columnDefinitions from '../static_data/table_columns';
import {
  commas,
  useMultiState,
  useWindowSize,
} from '../util';

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
  buttonBarLeft: css`
    display: flex;

    & > * + * {
      margin-left: 0.5rem;
    }

    .MuiTypography-root {
      color: var(--dark-blue);
      font-family: GTZirkonLight;
      margin: 6px 8px;
      text-transform: uppercase;
    }
  `,
  buttonBarRight: css`
    margin-left: auto;
  `,
  buttonBarButton: css`
    min-width: 40px;
  `,
  table: css`
    td.MuiTableCell-root {
      padding: 0.5rem;
    }
    th.MuiTableCell-root {
      padding: 0;
    }

    th .MuiButtonBase-root {
      /* width: 100%; */

      input.MuiInputBase-input {
        width: 100%;
      }

      & > span {
        width: 100%;
      }
    }
  `,
  fallbackContent: css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1rem;

    big {
      font-size: 150%;
    }
  `,
};


const DEFAULT_COLUMNS = columnDefinitions
  .filter(colDef => colDef?.initialCol)
  .map(colDef => colDef.key);

const DROPDOWN_COLUMNS = columnDefinitions
  .filter(colDef => colDef.type === "dropdown")
  .map(colDef => colDef.key);

const SLIDER_COLUMNS = columnDefinitions
  .filter(colDef => colDef.type === "slider")
  .map(colDef => colDef.key);

const DEFAULT_FILTER_VALUES = {
  name: [],
  country: [],
  continent: [],
  stage: [],
  ai_pubs: [0, 100],
  ai_patents: [0, 100],
};
const initialVal = (key) => {
  return DEFAULT_FILTER_VALUES[key]?.join(',') ?? '';
}
const resetVal = (key) => {
  return DEFAULT_FILTER_VALUES[key] ?? [];
};

const listToDropdownOptions = (list) => {
  return list.map(o => ({val: o, text: o}));
}

const AGGREGATE_SUM_COLUMNS = [
  'ai_pubs',
  'ai_patents',
];


// Determine whether a given row matches the filters and/or selected group
const filterRow = (row, filters, selectedGroup) => {
  const filterKeys = Object.keys(filters);

  if ( selectedGroup !== NO_SELECTED_GROUP ) {
    if ( ! groupsList[selectedGroup].members.includes(row.CSET_id) ) {
      return false;
    }
  }

  for ( const colDef of columnDefinitions ) {
    if ( !filterKeys.includes(colDef.key) ) {
      continue;
    }

    // Extract the appropriate value from the row, as defined for the column
    // (for example, the `value` key of the `ai_pubs` column).
    const rowVal = colDef?.extract?.(row[colDef.key]) ?? row[colDef.key];

    if ( colDef.type === "dropdown" ) {
      if ( filters?.[colDef.key].length > 0 ) {
        if ( ! filters?.[colDef.key].includes(rowVal) ) {
          return false;
        }
      }
    } else if ( colDef.type === "slider" ) {
      if ( filters?.[colDef.key].length !== 2 ) {
        console.error(`Invalid filter value for range filter '${colDef.key}': expecting [min, max], got ${JSON.stringify(filters?.[colDef.key].get)}`);
        continue;
      }

      const [min, max] = filters[colDef.key];
      if ( rowVal < min || ( max < 100 && max < rowVal) ) {
        return false;
      }
    } else if ( colDef.type === "stock" ) {
      // TODO: Figure out how we're filtering the `market_list` column
      // -- Actually - are we even wanting this column, or did I just make
      //    it as a placeholder?
    } else {
      console.error(`Invalid column type for key '${colDef.key}': column.type should be either "dropdown" or "slider" but is instead "${colDef.type}"`);
    }
  }

  return true;
};


const ListViewTable = ({
  data,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const windowSize = useWindowSize();

  const [selectedGroup, setSelectedGroup] = useQueryParamString('group', NO_SELECTED_GROUP);

  // Using param name 'zz_columns' to keep the columns selection at the end of
  // the URL.  I'm theorizing that users are most likely to care about the other
  // filters when looking at the URL, so it makes sense that filter params like
  // 'ai_pubs' are at the beginning of the URL, which is more directly visible
  // to users. (`useQueryParamString` appears to order the params alphabetically)
  const [columnsParam, setColumnsParam] = useQueryParamString('zz_columns', DEFAULT_COLUMNS.join(','));


  // Store filters via the URL parameters, making the values (and setters)
  // accessible via an object.
  const filters = useMultiState(
    {
      name: useQueryParamString('name', initialVal('name')),
      country: useQueryParamString('country', initialVal('country')),
      continent: useQueryParamString('continent', initialVal('continent')),
      stage: useQueryParamString('stage', initialVal('stage')),
      // ...
      ai_pubs: useQueryParamString('ai_pubs', initialVal('ai_pubs')),
      ai_patents: useQueryParamString('ai_patents', initialVal('ai_patents')),
      // ...
      // market_list: useQueryParamString('market_list', ''),
    },
    (key, val) => {
      if ( DROPDOWN_COLUMNS.includes(key) ) {
        let result = val.split(',').filter(e => e !== "");
        if ( key === 'name' ) {
          result = result.map(e => e.replace('&comma;', ','));
        }
        return result;
      } else if ( SLIDER_COLUMNS.includes(key) ) {
        return val?.split(',').map(e => parseInt(e));
      } else {
        return val?.split(',').filter(e => e !== "");
      }
    },
    (key, val) => {
      if ( key === 'name' ) {
        val = val.map(e => e.replace(',', '&comma;'));
      }
      return val?.join(',');
    }
  );

  // Read-only object of the currently-set values of the filters
  const currentFilters = useMemo(
    () => {
      return Object.fromEntries(
        Object.entries(filters).map( ([k, { get }]) => ([k, get]) )
      );
    },
    [filters]
  );

  const handleDropdownChange = (columnKey, newVal) => {
    if ( ! Array.isArray(newVal) ) {
      newVal = [newVal];
    }

    if ( filters?.[columnKey] ) {
      filters[columnKey].set(newVal);
    }
  };

  const handleSliderChange = (columnKey, newVal) => {
    if ( filters?.[columnKey] ) {
      filters[columnKey].set(newVal);
    }
  };

  // Filter the data for display.
  const dataForTable = data.filter(row => filterRow(row, currentFilters, selectedGroup));
  const numRows = dataForTable.length;
  const totalRows = data.length;

  // The filter options available for each column, given the currently-applied
  // filters from the other columns.
  const narrowedFilterOptions = useMemo(
    () => {
      const columns = Object.keys(currentFilters).filter(e => DROPDOWN_COLUMNS.includes(e));
      const results = {};

      for ( const column of columns ) {
        // Ignore the filter value for the current column since we want to
        // provide the full range of options there.
        const otherFilters = { ...currentFilters };
        delete otherFilters[column];

        const filteredSubset = data.filter((row) => {
          // If we don't have any data to display, then give the user all the
          // possible filter options.  Otherwise, only show those that match
          // the other active filters.
          return (
            numRows === 0 ||
            filterRow(row, otherFilters, selectedGroup)
          );
        });

        results[column] = listToDropdownOptions(
          [...new Set(filteredSubset.map(row => row[column]))].sort()
        );
      }

      return results;
    },
    [data, currentFilters]
  );


  // Prepare the columns that we will display in the `<Table>`, including
  // adding the appropriate filter mechanisms to the header cells.
  const columns = columnDefinitions
    .filter(colDef => columnsParam.includes(colDef.key))
    .map((colDef) => {
      let display_name;
      switch ( colDef.type ) {
        case 'dropdown':
          display_name = (
            <HeaderDropdown
              label={colDef.title}
              options={narrowedFilterOptions?.[colDef.key]}
              selected={filters?.[colDef.key].get}
              setSelected={newVal => handleDropdownChange(colDef.key, newVal)}
            />
          );
          break;
        case 'slider':
          display_name = (
            <HeaderSlider
              label={colDef.title}
              onChange={newVal => handleSliderChange(colDef.key, newVal)}
              value={filters?.[colDef.key].get}
            />
          );
          break;
        case 'stock':
          display_name = (
            colDef.title
          );
          break;
        default:
          display_name = colDef.title;
      }
      const column = {
        ...colDef,
        display_name,
      };
      return column;
    });

  // Prepare a mapping of column key --> column index; necessary for the table
  // sort comparator to be able to extract the correct values from each row.
  const colDefIndices = {};
  columnDefinitions.forEach((def, ix) => {
    colDefIndices[def.key] = ix;
  });


  const resetFilters = () => {
    columnDefinitions.forEach((colDef) => {
      filters[colDef.key]?.set(resetVal(colDef.key));
    });
    setSelectedGroup(NO_SELECTED_GROUP);
  };


  const aggregateData = useMemo(
    () => {
      const aggregate = dataForTable
        .reduce((acc, curr) => {
          for ( const colDef of columnDefinitions ) {
            if ( !AGGREGATE_SUM_COLUMNS.includes(colDef.key) ) {
              continue;
            }
            const keyVal = curr[colDef.key];
            const keyValExtract = colDef?.extract?.(keyVal) ?? keyVal;
            acc[colDef.key] = (acc[colDef.key] ?? 0) + keyValExtract;
          }
          return acc;
        }, {});

      return aggregate;
    },
    [dataForTable]
  );

  const footerData = Object.fromEntries(
    Object.entries(aggregateData)
      .map(([key, data]) => [key, <>Total: {commas(data)}</>])
  );

  return (
    <div className="list-view-table" data-testid="list-view-table">
      <GroupSelector
        groupsList={groupsList}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />
      <div css={styles.buttonBar}>
        <div css={styles.buttonBarLeft}>
          <Button
            css={styles.buttonBarButton}
            onClick={resetFilters}
          >
            <CloseIcon />
            <span className={classes([windowSize < 300 && "sr-only"])}>
              Reset filters
            </span>
          </Button>
          <Typography>
            Viewing {numRows !== totalRows ? `${numRows} of ${totalRows}` : totalRows} companies
          </Typography>
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
        data={dataForTable}
        fallbackContent={
          <div css={styles.fallbackContent}>
            <big>No results found</big>
            <span>Try adjusting your filters to get more results</span>
          </div>
        }
        footerData={footerData}
        paginate={true}
        showFooter={selectedGroup !== NO_SELECTED_GROUP && Object.keys(footerData).length > 0}
        sortByDir="desc"
        sortByKey="ai_pubs"
      />
      <AddRemoveColumnDialog
        columnDefinitions={columnDefinitions}
        isOpen={dialogOpen}
        selectedColumns={columnsParam}
        updateIsOpen={setDialogOpen}
        updateSelectedColumns={setColumnsParam}
      />
    </div>
  );
};

export default ListViewTable;
