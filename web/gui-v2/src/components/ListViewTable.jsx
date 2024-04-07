import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';
import { getQueryParams, useQueryParamString } from 'react-use-query-param-string';
import { css } from '@emotion/react';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import {
  Button,
  Typography,
} from '@mui/material';

import {
  HelpTooltip,
  Table,
  classes,
} from '@eto/eto-ui-components';

import AddRemoveColumnDialog from './AddRemoveColumnDialog';
import HeaderDropdown from './HeaderDropdown';
import HeaderSlider from './HeaderSlider';
import overallData from '../static_data/overall_data.json';
import columnDefinitions, { columnKeyMap } from '../static_data/table_columns';
import { tooltips } from '../static_data/tooltips';
import {
  calculateMedian,
  commas,
  useMultiState,
  useWindowSize,
} from '../util';
import { plausibleEvent } from '../util/analytics';
import { formatActiveSliderFilter } from '../util/format';

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
  viewCount: css`
    align-items: center;
    display: flex;

    & > span {
      align-items: center;
      display: flex;
      margin-left: 0.5rem;
    }
  `,
  activeFilterTooltip: css`
    .MuiTooltip-tooltip {
      max-width: 400px;

      li > span {
        font-family: GTZirkonLight;
      }
    }
  `,
  activeFiltersList: css`
    margin: 0;
    padding-left: 1rem;
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
      vertical-align: bottom;

      & > .table--headerCell--withSubheading,
      & > .MuiTableSortLabel-root {
        padding: 0.5rem;
      }

      & > .table--headerCell--sortableWrapper {
        align-content: end;
      }
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

    tr.parat-company-group td {
      background-color: var(--aqua-lighter);
    }

    /*
     * Fix font in pagination controls - to be resolved upstream by
     * https://github.com/georgetown-cset/eto-ui-components/issues/361
     */
    .MuiTablePagination-selectLabel,
    .MuiTablePagination-select {
      font-family: GTZirkonLight;
    }

    tfoot.table-footer > tr {
      td:first-child {
        border-left: none;
      }

      td:last-child {
        border-right: none;
      }
    }
  `,
  dropdownEntryWithTooltip: css`
    align-items: center;
    display: flex;
  `,
  groupExplanationTooltip: css`
    .MuiTooltip-tooltip {
      max-width: 450px;

      ul {
        margin: 0.5rem 0;
        padding-left: 20px;

        li {
          font-family: GTZirkonLight;
        }

        li + li {
          margin-top: 0.5rem;
        }
      }
    }
  `,
  shortDropdown: css`
    .MuiPaper-root {
      max-height: 192px;
    }
  `,
  aggregateCell: css`
    display: flex;
    justify-content: space-between;
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

/**
 * @typedef {string} ColumnKey The `key` property for a defined column
 * @typedef {Array<string>} FilterDropdownValue The selected element(s) from a dropdown
 * @typedef {[number, number]} FilterSliderValue The upper and lower bounds of a slider-based filter.
 */

/**
 * A read-only version of the currently-applied filters, in a format that is
 * easier to access.
 * @typedef {{
 *    _companies: FilterDropdownValue | FilterSliderValue,
 *    _groups: FilterDropdownValue | FilterSliderValue,
 *    [key: ColumnKey]: FilterDropdownValue | FilterSliderValue,
 * }} CurrentFiltersObject
 * @readonly
 */

/**
 * The current, definitive source for filter values, including access to the
 * setters for updating filters.
 * @typedef {{
 *    [key: ColumnKey]: {
 *      get get(): FilterDropdownValue | FilterSliderValue;
 *      set: (newVal: FilterDropdownValue | FilterSliderValue) => void;
 *    }
 * }} FilterStateObject
 */

const GROUPS_OPTIONS = Object.entries(overallData.groups)
  .map(([k, v]) => ({
    text: (
      tooltips?.groupExplanations?.[k] ?
        <div css={styles.dropdownEntryWithTooltip}>
          {v.name} <HelpTooltip css={styles.groupExplanationTooltip} text={tooltips.groupExplanations[k]} />
        </div>
      :
        v.name
    ),
    val: `GROUP:${k}`,
  }));

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
const SLIDER_PERCENTAGE_COLUMNS = [];
const AGGREGATE_SUM_COLUMNS = [];
const AGGREGATE_MEDIAN_COLUMNS = [];
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

    if ( colDef?.isGrowthStat || colDef?.isPercent ) {
      SLIDER_PERCENTAGE_COLUMNS.push(colDef.key);
    }

    if ( colDef?.aggregateType === 'sum' ) {
      AGGREGATE_SUM_COLUMNS.push(colDef.key);
    } else if ( colDef?.aggregateType === 'median' ) {
      AGGREGATE_MEDIAN_COLUMNS.push(colDef.key);
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
      if ( ( -100 < min && rowVal < min ) || ( max < 100 && max < rowVal ) ) {
        return false;
      }
    } else {
      console.error(`Invalid column type for key '${colDef.key}': column.type should be either "companyName", "dropdown", or "slider" but is instead "${colDef.type}"`);
    }
  }

  return true;
};


/**
 * Extract the current state of the filters and present them in a format that is
 * easier to understand.
 *
 * @param {FilterStateObject} filters A `filters` object, as created by `useMultiState` and `useQueryParamString`.
 * @returns {CurrentFiltersObject} A read-only version of the current state of the filters
 * @readonly
 */
const extractCurrentFilters = (filters) => {
  return Object.freeze(
    Object.fromEntries(
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
    )
  );
};


export const exportsForTestingOnly = {
  extractCurrentFilters,
  filterRow,
};


const AggregateCell = ({
  isPercent = false,
  label,
  value,
}) => {
  return (
    <div css={styles.aggregateCell}>
      <span>{label}:</span>
      <span>{value}{isPercent && '%'}</span>
    </div>
  );
}


const ListViewTable = ({
  data,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const windowSize = useWindowSize();
  const isFirstRender = useRef(true);
  const tableRef = useRef();

  const [initialQueryParams] = useState(() => getQueryParams());
  const initialSortParam = initialQueryParams?.sort;

  const [sortParam, setSortParam] = useQueryParamString('sort', 'ai_pubs-desc');
  const [sortDir, setSortDir] = useState(() => (initialSortParam ?? sortParam).split('-')[1]);
  const [sortKey, setSortKey] = useState(() => (initialSortParam ?? sortParam).split('-')[0]);

  // Using param name 'zz_columns' to keep the columns selection at the end of
  // the URL.  I'm theorizing that users are most likely to care about the other
  // filters when looking at the URL, so it makes sense that filter params like
  // 'ai_pubs' are at the beginning of the URL, which is more directly visible
  // to users. (`useQueryParamString` appears to order the params alphabetically)
  const [columnsParam, setColumnsParam] = useQueryParamString('zz_columns', DEFAULT_COLUMNS.join(','));

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

  // Re-establish dropdown filter values that we receive from the URL parameters
  // but were overwritten by the Autocomplete in HeaderDropdown, causing the
  // dropdown filters to not persist across page refreshes
  // (see https://github.com/georgetown-cset/parat/issues/179)
  useEffect(() => {
    DROPDOWN_COLUMNS.forEach((key) => {
      if ( initialQueryParams?.[key] ) {
        filters[key].set(initialQueryParams[key].split(','));
      }
    });
  }, []);

  // Update the URL param when we sort the table.  Note that we don't need the
  // inverse (param -> state) because the page will reload when the users adjusts
  // the URL param (plus it caused the sort states to bounce between the specified
  // sort and the default).
  useEffect(() => {
    setSortParam(`${sortKey}-${sortDir}`);
  }, [sortDir, sortKey]);

  // Read-only object of the currently-set values of the filters
  const currentFilters = useMemo(
    () => extractCurrentFilters(filters),
    [filters]
  );

  const activeFilters = useMemo(() => {
    return Object.entries(currentFilters)
      .filter(e => !e[0].startsWith('_'))
      .filter(e => JSON.stringify(DEFAULT_FILTER_VALUES[e[0]]) !== JSON.stringify(e[1]));
  }, [currentFilters]);

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

  // Reset the table pagination when the filters are adjusted
  useEffect(() => {
    tableRef.current.resetPagination();
  }, [JSON.stringify(currentFilters)]);

  // Filter the data for display.
  const { rows: dataForTable, numCompanies } = useMemo(() => {
    const companies = data.filter(row => filterRow(row, currentFilters));
    const groups = currentFilters._groups
      .map(groupId => ({
        ...overallData.groups[groupId],
        _class: "parat-company-group",
        _group: true,
      }));

    return {
      rows: [ ...companies, ...groups ],
      numCompanies: companies.length,
      numGroups: groups.length,
    }
  }, [currentFilters]);
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
            numCompanies === 0 ||
            filterRow(row, otherFilters)
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
      let subheading;
      switch ( colDef.type ) {
        case 'companyName':
        case 'dropdown':
          // Set a minimum width for the dropdown menu (not the column)
          let dropdownWidth;
          if ( colDef?.dropdownWidth ) {
            dropdownWidth = css`
              .MuiPaper-root {
                min-width: ${colDef.dropdownWidth}px;
              }
            `;
          }

          subheading = (
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
          subheading = (
            <HeaderSlider
              initialValue={initialQueryParams?.[colDef.key]}
              label={colDef.title}
              min={colDef.isGrowthStat ? -100 : 0}
              onChange={newVal => handleSliderChange(colDef.key, newVal)}
              value={filters?.[colDef.key].get}
            />
          );
          break;
      }
      const column = {
        ...colDef,
        display_name: (
          tooltips.columnHeaders?.[colDef.key] ?
            <HelpTooltip text={tooltips.columnHeaders[colDef.key]}>
              <label>{colDef.title}</label>
            </HelpTooltip>
          :
            <label>{colDef.title}</label>
        ),
        subheading,
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
            if ( AGGREGATE_MEDIAN_COLUMNS.includes(colDef.key) ) {
              const dataKey = colDef.dataKey ?? colDef.key;
              const keyVal = curr[dataKey];
              const keyValExtract = colDef?.extract?.(keyVal, curr) ?? keyVal;
              if ( Array.isArray(acc[colDef.key]) ) {
                acc[colDef.key].push(keyValExtract);
              } else {
                acc[colDef.key] = [keyValExtract];
              }
            } else if ( AGGREGATE_SUM_COLUMNS.includes(colDef.key) ) {
              const dataKey = colDef.dataKey ?? colDef.key;
              const keyVal = curr[dataKey];
              const keyValExtract = colDef?.extract?.(keyVal, curr) ?? keyVal;
              acc[colDef.key] = (acc[colDef.key] ?? 0) + keyValExtract;
            }
          }
          return acc;
        }, {});

      return aggregate;
    },
    [dataForTable]
  );

  const footerData = Object.fromEntries(
    Object.entries(aggregateData)
      .map(([key, data]) => {
        if ( AGGREGATE_MEDIAN_COLUMNS.includes(key) ) {
          return [key, <AggregateCell label="Median" value={calculateMedian(data)} isPercent={SLIDER_PERCENTAGE_COLUMNS.includes(key)} />];
        } else if ( AGGREGATE_SUM_COLUMNS.includes(key) ) {
          return [key, <AggregateCell label="Total" value={commas(data)} />];
        }
      })
  );


  const exportHeaders = columns.flatMap((colDef) => {
    const headers = [ { key: colDef.key, label: colDef.title } ];
    // Derived columns aren't able to calculate a rank
    if ( colDef.type === "slider" && !colDef?.isDerived ) {
      headers.push({ key: `${colDef.key}_rank`, label: `${colDef.title} rank` });
    }
    return headers;
  });
  const exportData = useMemo(() => {
    return dataForTable
      .map((row) => {
        const entry = {};
        for ( const colDef of columns ) {
          if ( Object.hasOwn(colDef, "dataKey") && Object.hasOwn(colDef, "dataSubkey") ) {
            const value = row[colDef.dataKey][colDef.dataSubkey];
            if ( colDef.type === "slider" && !colDef?.isDerived ) {
              entry[colDef.key] = value.total;
              entry[`${colDef.key}_rank`] = value.rank;
            } else if ( Object.hasOwn(colDef, "extract") ) {
              entry[colDef.key] = colDef.extract(value, row);
            }
          } else if ( Object.hasOwn(colDef, "dataKey") ) {
            entry[colDef.key] = row[colDef.dataKey];
          } else {
            entry[colDef.key] = row[colDef.key];
          }
        }
        return entry;
      })
      .sort((a, b) => {
        const direction = sortDir ? -1 : 1;
        if ( Object.hasOwn(a, sortKey) && Object.hasOwn(b, sortKey) ) {
          if ( SLIDER_COLUMNS.includes(sortKey) ) {
            if ( a[sortKey] < b[sortKey] ) {
              return -1 * direction;
            } else if ( b[sortKey] < a[sortKey] ) {
              return 1 * direction;
            } else {
              return 0;
            }
          } else {
            return a[sortKey].localeCompare(b[sortKey]) * direction;
          }
        }
        // If the sorting column isn't visible, default to sorting by company
        // name (which is always visible).
        return a.name.localeCompare(b.name) * direction;
      });
  }, [dataForTable]);


  const activeFiltersTooltip = (
    <>
      <label>Active filters:</label>
      <ul css={styles.activeFiltersList}>
        {activeFilters.map((filter) => {
          const [key, values] = filter;
          const title = columnKeyMap[key];
          if ( DROPDOWN_COLUMNS.includes(key) ) {
            return <li>{title}: <span>{values.join(", ")}</span></li>;
          } else {
            const formatted = formatActiveSliderFilter(
              values,
              DEFAULT_FILTER_VALUES[key],
              SLIDER_GROWTH_COLUMNS.includes(key)
            );
            return <li>{title}: <span>{formatted}</span></li>;
          }
        })}
      </ul>
    </>
  );

  return (
    <div id="table" className="list-view-table" data-testid="list-view-table">
      <div css={styles.buttonBar}>
        <div css={styles.buttonBarLeft}>
          <Typography css={styles.viewCount}>
            {windowSize >= 430 && <>Viewing </>}
            {numCompanies !== totalRows ? `${numCompanies} of ${totalRows}` : totalRows} companies
            {activeFilters.length > 0 &&
              <HelpTooltip css={styles.activeFilterTooltip} text={activeFiltersTooltip} />
            }
          </Typography>
        </div>
        <div css={styles.buttonBarRight}>
          <HelpTooltip css={styles.activeFilterTooltip} text={activeFiltersTooltip}>
            <Button
              css={styles.buttonBarButton}
              disabled={activeFilters.length == 0}
              onClick={resetFilters}
            >
              <CloseIcon />
              <span className={classes([windowSize < 540 && "sr-only"])}>
                Reset filters {activeFilters.length > 0 && <span style={{fontFamily: "GTZirkonRegular"}}>({activeFilters.length} active)</span>}
              </span>
            </Button>
          </HelpTooltip>
          <CSVLink data={exportData} filename="eto-parat-export.csv" headers={exportHeaders}>
            <Button
              css={styles.buttonBarButton}
              title="Download the results as a comma-separated value (CSV) file.  Existing sorts will be retained."
            >
              <DownloadIcon />
              <span className={classes([windowSize < 840 && "sr-only"])}>
                Download results
              </span>
            </Button>
          </CSVLink>
          <Button css={styles.buttonBarButton} onClick={() => setDialogOpen(true)}>
            <AddCircleOutlineIcon />
            <span className={classes([windowSize < 700 && "sr-only"])}>
              Add/remove columns
            </span>
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        css={styles.table}
        data={dataForTable}
        footerData={footerData}
        minHeight={400}
        paginate={true}
        pinRow="_group"
        ref={tableRef}
        rowsPerPageOptions={[10, 20, 50, 100]}
        showFooter={currentFilters.name.length > 0}
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
