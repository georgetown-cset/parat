// much thanks due to the examples here https://material-ui.com/components/tables/

import {company_data} from "../static_data/data";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import TextField from "@material-ui/core/TextField/TextField";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Slider from "@material-ui/core/Slider";
import React from "react";

const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Company Name" },
  { id: "country", numeric: false, disablePadding: false, label: "Country" },
  { id: "continent", numeric: false, disablePadding: false, label: "Region" },
  { id: "stage", numeric: false, disablePadding: false, label: "Company Stage" },
  { id: "ai_pubs", numeric: true, disablePadding: false, label: "AI Publications" },
  { id: "ai_pubs_in_top_conferences", numeric: true, disablePadding: false, label: "Top AI Conf Pubs" },
  { id: "ai_patents", numeric: true, disablePadding: false, label: "AI Patents" },
];

function CompanyTableHead(props) {
  const { order, onRequestSort, onFilterRows, filterValues, maxSliderValue, filteredFilters} = props;
  const companyNames = get_data_list("name");
  const countries = get_data_list("country");
  const continents = get_data_list("continent");
  const stages = get_data_list("stage");

  function get_data_list(key){
    if(filteredFilters[key] === null){
      return [...new Set(company_data.map(company => company[key]).filter(c => c !== null))].sort()
    }
    return [...new Set(filteredFilters[key])].sort();
  }

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  function handleFilter(evt, values, key){
    onFilterRows(key, [...values]);
  }

  function valueLabelFormat(value) {
    if(value === maxSliderValue){
      return maxSliderValue+"+"
    }
    return value
  }

  const dropdownMetadata = [
    {"key": "name", "label": "Company Name", "minWidth": "200px", values: companyNames, colSpan: 2},
    {"key": "country", "label": "Country", "minWidth": "150px", values: countries, colSpan: 1},
    {"key": "continent", "label": "Region", "minWidth": "150px", values: continents, colSpan: 1},
    {"key": "stage", "label": "Stage", "minWidth": "70px", values: stages, colSpan: 1},
  ];

  return (
    <TableHead>
      <TableRow>
        {dropdownMetadata.map((meta) => (
          <TableCell
             key={meta.key}
             align={"left"}
             padding={"none"}
             colSpan={meta.colSpan}
           >
            <Autocomplete
               multiple
               id={meta.key+"-search"}
               disabled={meta.values.length === 0}
               options={meta.values}
               style={{ minWidth: meta.minWidth, paddingLeft:"20px" }}
               size="small"
               renderInput={(params) => <TextField {...params} label={meta.label}/>}
               onChange={(evt, values) => handleFilter(evt, values, meta.key)}
               value={filterValues[meta.key]}
              />
          </TableCell>
        ))}
        {headCells.map((headCell) => (
            headCell.id.startsWith("ai_") &&
              <TableCell
                key={headCell.id}
                align={"center"}
                style={{ width: "140px", verticalAlign: "bottom" }}
                sortDirection={order[headCell.id] === 1 ? "asc" : "desc"}
              >
                <TableSortLabel
                  active={true}
                  direction={order[headCell.id] === 1 ? "desc" : "asc"}
                  onClick={createSortHandler(headCell.id)}
                  style={{padding: "0"}}
                  hideSortIcon={true}
                >
                  {headCell.label}
                </TableSortLabel>
                <Slider
                  value={filterValues[headCell.id]}
                  onChange={(evt, newRange) => handleFilter(evt, newRange, headCell.id)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={valueLabelFormat}
                />
              </TableCell>
          ))
        }
      </TableRow>
    </TableHead>
  );
}

export default CompanyTableHead;