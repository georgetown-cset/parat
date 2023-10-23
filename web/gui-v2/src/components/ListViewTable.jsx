import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { splitCustomGroup } from './EditCustomCompanyGroupDialog';
import HeaderDropdown from './HeaderDropdown';
import HeaderSlider from './HeaderSlider';
import GroupSelector, { NO_SELECTED_GROUP, USER_CUSTOM_GROUP } from './ListViewGroupSelector';
import groupsList from '../static_data/groups';
import overallData from '../static_data/overall_data.json';
import columnDefinitions from '../static_data/table_columns';
import {
  commas,
  useMultiState,
  useWindowSize,
} from '../util';
import { plausibleEvent } from '../util/analytics';

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
      input.MuiInputBase-input {
        width: 100%;
      }

      & > span {
        width: 100%;
      }
    }

    svg.MuiSvgIcon-root.MuiTableSortLabel-icon {
      background-color: var(--bright-blue);
      color: white;
      padding: 2px;
      margin-left: 1rem;
    }
  `,
  shortDropdown: css`
    .MuiPaper-root {
      max-height: 192px;
    }
  `,
  fallbackContent: css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 1rem;

    big {
      font-size: 150%;
    }
  `,
};


const GROUPS_OPTIONS = Object.entries(overallData.groups).map(([k, v]) => ({ text: v, val: `GROUP:${k}` }));

const DATAKEYS_WITH_SUBKEYS = [
  "articles",
  "patents",
  "other_metrics",
];

const DEFAULT_COLUMNS = [];
const DROPDOWN_COLUMNS = [];
const SLIDER_COLUMNS = [];
const SLIDER_NATURAL_COLUMNS = [];
const SLIDER_GROWTH_COLUMNS = [];
columnDefinitions.forEach((colDef) => {
  if ( colDef?.initialCol ) {
    DEFAULT_COLUMNS.push(colDef.key);
  }
  if ( colDef.type === "companyName" || colDef.type === "dropdown" ) {
    DROPDOWN_COLUMNS.push(colDef.key);
  } else if ( colDef.type === "slider" ) {
    SLIDER_COLUMNS.push(colDef.key);
    if ( colDef?.isGrowthStat ) {
      SLIDER_GROWTH_COLUMNS.push(colDef.key);
    } else {
      SLIDER_NATURAL_COLUMNS.push(colDef.key);
    }
  }
});

const ALL_COLUMNS = [
  ...DROPDOWN_COLUMNS,
  ...SLIDER_COLUMNS,
];

const DEFAULT_FILTER_VALUES = {
  ...DROPDOWN_COLUMNS.reduce((obj, e) => { obj[e] = []; return obj; }, {}),
  ...SLIDER_NATURAL_COLUMNS.reduce((obj, e) => { obj[e] = [0, 100]; return obj; }, {}),
  ...SLIDER_GROWTH_COLUMNS.reduce((obj, e) => { obj[e] = [-100, 100]; return obj; }, {}),
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

/**
 * Determine whether a given row matches the filters
 *
 * @param {object} row A company detail object
 * @param {object} filters The currently-active filters
 * @returns {boolean} `true` if the row matches the filters, `false` otherwise
 */
const filterRow = (row, filters) => {
  const filterKeys = Object.keys(filters);

  for ( const colDef of columnDefinitions ) {
    // Ignore columns that are not filterable
    if ( !filterKeys.includes(colDef.key) ) {
      continue;
    }

    // Extract the appropriate value from the row, as defined for the column
    // (for example, the `value` key of the `ai_pubs` column).
    const dataKey = colDef.dataKey ?? colDef.key;
    let rawVal = row[dataKey];
    if ( colDef.dataKey && DATAKEYS_WITH_SUBKEYS.includes(colDef.dataKey) ) {
      rawVal = rawVal[colDef.dataSubkey];
    }
    const rowVal = colDef?.extract?.(rawVal, row) ?? rawVal;

    if ( colDef.type === "companyName" ) {
      if ( filters?.[colDef.key].length > 0 ) {
        // We want to include a row (i.e. a company) if either condition is met:
        //   1) Any "GROUP:*" entry in the filter matches with the row
        //   2) The company name is in filter array
        // If **NEITHER** condition is met, the row shouldn't be included, and
        // therefore we return `false`.  Otherwise, we do nothing and let later
        // columns do their checks.

        let inSelectedGroup = false;
        for ( const group of filters._groups ) {
          if ( row.groups[group] ) {
            inSelectedGroup = true;
          }
        }
        const inFilteredCompanies = filters._companies.includes(rowVal);

        if ( ! (inSelectedGroup || inFilteredCompanies) ) {
          return false;
        }
      }
    } else if ( colDef.type === "dropdown" ) {
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
    } else {
      console.error(`Invalid column type for key '${colDef.key}': column.type should be either "companyName", "dropdown", or "slider" but is instead "${colDef.type}"`);
    }
  }

  return true;
};


export const exportsForTestingOnly = {
  filterRow,
};


const ListViewTable = ({
  data,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const windowSize = useWindowSize();

  const [sortDir, setSortDir] = useState('desc');
  const [sortKey, setSortKey] = useState('ai_pubs');
  const isFirstRender = useRef(true);

  const [selectedGroup, setSelectedGroup] = useQueryParamString('group', NO_SELECTED_GROUP);

  // Using param name 'zz_columns' to keep the columns selection at the end of
  // the URL.  I'm theorizing that users are most likely to care about the other
  // filters when looking at the URL, so it makes sense that filter params like
  // 'ai_pubs' are at the beginning of the URL, which is more directly visible
  // to users. (`useQueryParamString` appears to order the params alphabetically)
  const [columnsParam, setColumnsParam] = useQueryParamString('zz_columns', DEFAULT_COLUMNS.join(','));

  // Custom, user-defined group of companies.  Again naming the key to keep it
  // after the filter parameters.  The 'Retained' version is for preserving the
  // custom group composition when the user is viewing a different group
  // (see `handleSelectedGroupChange()`).
  const [customGroup, setCustomGroup] = useQueryParamString('zc_companies', '');
  const [customGroupRetained, setCustomGroupRetained] = useState('');

  // Store filters via the URL parameters, making the values (and setters)
  // accessible via an object.
  const filters = useMultiState(
    ALL_COLUMNS.reduce((obj, e) => {
      obj[e] = useQueryParamString(e, initialVal(e));
      return obj;
    }, {}),
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
        Object.entries(filters)
          .flatMap( ([key, { get }]) => {
            if ( key === 'name' ) {
              const groups = [];
              const nonGroups = [];
              get.forEach((entry) => {
                if ( entry.startsWith('GROUP:') ) {
                  groups.push(entry.slice(6));
                } else {
                  nonGroups.push(entry);
                }
              });
              return [
                [key, get],
                ['_groups', groups],
                ['_companies', nonGroups],
              ];
            } else {
              return [
                [key, get],
              ];
            }
          })
      );
    },
    [filters]
  );

  /**
   * When the user switches from a custom group to a pre-defined group, save the
   * companies that they included in the custom group in a separate state
   * variable (that is not connected to the displayed URL).  Restore the company
   * list when they return to custom group view.  This ensures that the custom
   * group remains available to the user, but that it's only in the shared URL
   * when the user is specifically in custom group mode.
   */
  const handleSelectedGroupChange = (newGroup) => {
    if ( newGroup !== selectedGroup ) {
      if ( newGroup === USER_CUSTOM_GROUP ) {
        if ( customGroupRetained !== '' ) {
          setCustomGroup(customGroupRetained);
          setCustomGroupRetained('');
        }
      } else {
        if ( selectedGroup === USER_CUSTOM_GROUP ) {
          setCustomGroupRetained(customGroup);
          setCustomGroup('');
        }
      }
    }

    setSelectedGroup(newGroup);
  };


  /**
   * The list of companies included in the currently-selected group.
   *
   * Cases and values:
   *  - Pre-defined group - an array of cset_id values
   *  - Custom group - an array of cset_id values
   *  - No selected group - false
   *  - Invalid group - null
   */
  const selectedGroupMembers = useMemo(
    () => {
      if ( selectedGroup === NO_SELECTED_GROUP ) {
        return false;
      } else if ( selectedGroup === USER_CUSTOM_GROUP ) {
        return splitCustomGroup(customGroup);
      } else if ( selectedGroup in groupsList ) {
        // Valid pre-defined groups
        return groupsList[selectedGroup].members;
      } else {
        // Invalid group
        return null;
      }
    },
    [selectedGroup, customGroup]
  );

  const companyList = useMemo(
    () => {
      return data.map(({ cset_id, name, country }) => ({ cset_id, name, country }));
    },
    [data]
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
  const dataForTable = data.filter(row => filterRow(row, currentFilters, selectedGroupMembers));
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
            filterRow(row, otherFilters, selectedGroupMembers)
          );
        });

        results[column] = listToDropdownOptions(
          [...new Set(filteredSubset.map(row => row[column]))]
            .filter(e => e !== null)
            .sort()
        );

        if ( column === "name" ) {
          results[column] = [
            { header: "Groups of companies" },
            ...GROUPS_OPTIONS,
            { header: "Companies" },
            ...results[column],
          ];
        }
      }

      return results;
    },
    [data, currentFilters]
  );


  // Prepare the columns that we will display in the `<Table>`, including
  // adding the appropriate filter mechanisms to the header cells.
  const columnsParamSplit = columnsParam.split(',');
  const columns = columnDefinitions
    .filter(colDef => columnsParamSplit.includes(colDef.key))
    .map((colDef) => {
      let display_name;
      switch ( colDef.type ) {
        case 'companyName':
        case 'dropdown':
          let dropdownWidth;
          if ( colDef?.minWidth ) {
            dropdownWidth = css`
              .MuiPaper-root {
                min-width: ${colDef.minWidth}px;
              }
            `;
          }

          display_name = (
            <HeaderDropdown
              css={[dataForTable.length === 0 && styles.shortDropdown, dropdownWidth]}
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

  // On the first render we don't want to trigger the Plausible event (since it's
  // the default sort).  Afterwards, when the sort changes we want to record it.
  useEffect(
    () => {
      if ( isFirstRender.current ) {
        isFirstRender.current = false;
      } else {
        plausibleEvent('Sorting list view table', { column: sortKey, direction: sortDir });
      }
    },
    [sortDir, sortKey]
  );

  const aggregateData = useMemo(
    () => {
      const aggregate = dataForTable
        .reduce((acc, curr) => {
          for ( const colDef of columnDefinitions ) {
            if ( !AGGREGATE_SUM_COLUMNS.includes(colDef.key) ) {
              continue;
            }
            const dataKey = colDef.dataKey ?? colDef.key;
            const keyVal = curr[dataKey];
            const keyValExtract = colDef?.extract?.(keyVal, curr) ?? keyVal;
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

  let fallbackBigText = <big>No results found</big>;
  let fallbackSmallText = <span>Try adjusting your filters to get more results</span>;
  if ( selectedGroupMembers === null ) {
    fallbackSmallText = <span>Invalid group '{selectedGroup}' selected &ndash; try another group</span>;
  } else if ( selectedGroup === USER_CUSTOM_GROUP && selectedGroupMembers.length === 0 ) {
    fallbackBigText = <big>No companies selected</big>
    fallbackSmallText = <span>Click 'Edit custom group' to add companies to this group and get results</span>
  }

  return (
    <div id="table" className="list-view-table" data-testid="list-view-table">
      <GroupSelector
        companyList={companyList}
        customGroup={customGroup}
        groupsList={groupsList}
        selectedGroup={selectedGroup}
        updateCustomGroup={setCustomGroup}
        updateSelectedGroup={handleSelectedGroupChange}
      />
      <div css={styles.buttonBar}>
        <div css={styles.buttonBarLeft}>
          <Button
            css={styles.buttonBarButton}
            onClick={resetFilters}
          >
            <CloseIcon />
            <span className={classes([windowSize < 490 && "sr-only"])}>
              Reset filters
            </span>
          </Button>
          <Typography>
            {windowSize >= 430 && <>Viewing </>}
            {numRows !== totalRows ? `${numRows} of ${totalRows}` : totalRows} companies
          </Typography>
        </div>
        <div css={styles.buttonBarRight}>
          {/* TODO: enable once downloads are possible */}
          <Button css={styles.buttonBarButton} disabled>
            <DownloadIcon />
            <span className={classes([windowSize < 780 && "sr-only"])}>
              Download results
            </span>
          </Button>
          <Button css={styles.buttonBarButton} onClick={() => setDialogOpen(true)}>
            <AddCircleOutlineIcon />
            <span className={classes([windowSize < 650 && "sr-only"])}>
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
            {fallbackBigText}
            {fallbackSmallText}
          </div>
        }
        footerData={footerData}
        minHeight={400}
        paginate={true}
        showFooter={selectedGroup !== NO_SELECTED_GROUP && Object.keys(footerData).length > 0}
        sortByDir={sortDir}
        sortByKey={sortKey}
        updateSortByDir={setSortDir}
        updateSortByKey={setSortKey}
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
