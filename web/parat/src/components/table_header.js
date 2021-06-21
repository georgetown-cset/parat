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

  return (
    <TableHead>
      <TableRow>
        <TableCell
          key={"name"}
          align={"left"}
          padding={"none"}
          colSpan={2}
        >
          <Autocomplete
            multiple
            id="company-name-search"
            disabled={companyNames.length === 0}
            options={companyNames}
            style={{ minWidth: "200px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Company Name"/>}
            onChange={(evt, values) => handleFilter(evt, values, "name")}
            value={filterValues["name"]}
           />
        </TableCell>
        <TableCell
          key={"country"}
          align={"left"}
          padding={"none"}
        >
          <Autocomplete
            multiple
            id="country-search"
            disabled={countries.length === 0}
            options={countries}
            style={{ minWidth: "150px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Country"/>}
            onChange={(evt, values) => handleFilter(evt, values, "country")}
            value={filterValues["country"]}
           />
        </TableCell>
        <TableCell
          key={"continent"}
          align={"left"}
          padding={"none"}
        >
          <Autocomplete
            multiple
            id="continent-search"
            disabled={continents.length === 0}
            options={continents}
            style={{ minWidth: "150px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Region"/>}
            onChange={(evt, values) => handleFilter(evt, values, "continent")}
            value={filterValues["continent"]}
           />
        </TableCell>
        <TableCell
          key={"stage"}
          align={"left"}
          padding={"none"}
        >
          <Autocomplete
            multiple
            id="stage-search"
            disabled={stages.length === 0}
            options={stages}
            style={{ minWidth: "70px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Stage"/>}
            onChange={(evt, values) => handleFilter(evt, values, "stage")}
            value={filterValues["stage"]}
           />
        </TableCell>
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