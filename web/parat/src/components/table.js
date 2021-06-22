// much thanks due to the examples here https://material-ui.com/components/tables/
import React, {useRef} from "react";
import {company_data} from "../static_data/data";
import Paper from "@material-ui/core/Paper/Paper";
import Button from "@material-ui/core/Button";
import {defaults} from "react-chartjs-2";
import {makeStyles} from "@material-ui/core";
import ClearIcon from '@material-ui/icons/Clear';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import "chartjs-plugin-annotation";
import {CSVLink} from "react-csv";
import Row from "./row";
import CompanyTableHead from "./table_header"

// https://sevketyalcin.com/blog/responsive-charts-using-Chart.js-and-react-chartjs-2/
defaults.global.maintainAspectRatio = false;

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  paper: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: "400px",
    width: "80%",
  },
  visuallyHidden: {
    border: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1,
  },
}));

const CollapsibleTable = () => {
  const classes = useStyles();
  const [order, setOrder] = React.useState({
    "ai_pubs": 1,
    "ai_pubs_in_top_conferences": 1,
    "ai_patents": 1
  });
  const [priority, setPriority] = React.useState(["ai_pubs", "ai_pubs_in_top_conferences", "ai_patents"]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = React.useState(company_data.slice(0));
  // the "filteredFilters" is the data filtered by all attributes except company name, for use in restricting the filters
  const initialFilteredFilters = {
    "name": null,
    "country": null,
    "continent": null,
    "stage": null
  };
  const [filteredFilters, setFilteredFilters] = React.useState({...initialFilteredFilters});
  const [forceExpand, setForceExpand] = React.useState(false);

  const maxSliderValue = 100;
  const defaultFilterValues = {
    "ai_pubs": [0, maxSliderValue],
    "ai_pubs_in_top_conferences": [0, maxSliderValue],
    "ai_patents": [0, maxSliderValue],
    "name": [],
    "country": [],
    "continent": [],
    "stage": []
  };
  const [filterValues, setFilterValues] = React.useState({...defaultFilterValues});
  const headers = [
    { label: "cset_id", key: "CSET_id" },
    { label: "company_name", key: "name" },
    { label: "country", key: "country" },
    { label: "website", key: "website" },
    { label: "region", key: "continent" },
    { label: "stage", key: "stage" },
    { label: "ai_pubs_since_2010", key: "ai_pubs.value" },
    { label: "ai_pubs_in_top_conf_since_2010", key: "ai_pubs_in_top_conferences.value" },
    { label: "ai_patents_since_2010", key: "ai_patents.value" },
    { label: "ai_pubs_since_2010_rank", key: "ai_pubs.rank" },
    { label: "ai_pubs_in_top_conf_since_2010_rank", key: "ai_pubs_in_top_conferences.rank" },
    { label: "ai_patents_since_2010_rank", key: "ai_patents.rank" },
    { label: "market", key: "market_list"},
    { label: "crunchbase_uuid", key: "crunchbase.crunchbase_uuid" },
    { label: "crunchbase_url", key: "crunchbase.crunchbase_url" },
    { label: "aliases", key: "aliases" },
    { label: "grid_ids", key: "grid_info" },
    { label: "permids", key: "permid_info" },
    { label: "parents", key: "parent_info" },
    { label: "included_subsidiaries", key: "agg_child_info" },
    { label: "excluded_subsidiaries", key: "unagg_child_info" },
  ];
  const exportFilename = "cset-parat-export.csv";

  const toolbarRef = useRef();
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    toolbarRef.current.scrollIntoView();
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event, column_name) => {
    // only flip the sort ordering of the column if the column currently has top order priority
    if(column_name === priority[0]) {
      const updatedSortOrder = {...order};
      // flip the order from what it previously was
      updatedSortOrder[column_name] = -1 * order[column_name];
      setOrder(updatedSortOrder);
    }

    let updatedPriority = [column_name];
    updatedPriority = updatedPriority.concat(priority.filter(key => key !== column_name));
    setPriority(updatedPriority);
    setPage(0);
  };

  const resetFilter = () => {
    setFilterValues({...defaultFilterValues});
    setFilteredFilters({...initialFilteredFilters});
    setData(company_data.slice(0));
  };

  const handleFilterRows = (changed_key, filters) => {
    let clean_filters = filters;
    if(changed_key !== "sliders") {
      clean_filters = filters.filter(k => (k !== null) && (k !== ""));
    }
    const updatedFilterValues = {...filterValues};
    updatedFilterValues[changed_key] = clean_filters;
    setFilterValues(updatedFilterValues);

    const filtered_data = [];
    const key_filtered_data = {
      "name": [],
      "country": [],
      "continent": [],
      "stage": []
    };
    const slider_keys = ["ai_pubs", "ai_patents", "ai_pubs_in_top_conferences"];
    for(let datum of company_data) {
      let include = true;
      const include_key_filt = {};
      for(let key in key_filtered_data){
        include_key_filt[key] = true;
      }
      for (let key in updatedFilterValues) {
        // check within range if sliders
        if(slider_keys.includes(key)){
          const min_value = updatedFilterValues[key][0];
          const max_value = updatedFilterValues[key][1] === maxSliderValue ? 10000000 : updatedFilterValues[key][1];
          if ((datum[key]["value"] < min_value) || (datum[key]["value"] > max_value)){
            include = false;
          }
        }
        else if ((updatedFilterValues[key].length !== 0) && !updatedFilterValues[key].includes(datum[key])) {
          include = false;
          for(let other_key in key_filtered_data){
            if(other_key !== key) {
              include_key_filt[other_key] = false;
            }
          }
        }
      }
      if(include){
        filtered_data.push(datum);
      }
      for(let key in key_filtered_data){
        if(include_key_filt[key] && (key in datum) && (datum[key] !== null)){
          if(key_filtered_data[key] === null){
            key_filtered_data[key] = [];
          }
          key_filtered_data[key].push(datum[key])
        }
      }
    }
    setData(filtered_data);
    setFilteredFilters(key_filtered_data);
    setPage(0);
  };

  function compare(a, b) {
    for(let key of priority) {
      if (b[key]["value"] < a[key]["value"]) {
        return -1*order[key];
      }
      if (b[key]["value"] > a[key]["value"]) {
        return 1*order[key];
      }
    }
    return 0;
  }

  function stableSort(array) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const sortOrder = compare(a[0], b[0]);
      if (sortOrder !== 0){
        return sortOrder;
      }
      return a[1]["value"] - b[1]["value"];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  return (
    <div style={{minWidth: "1150px", margin:"10px 1% 20px 1%", textAlign: "center"}}>
      <div id="button-panel" style={{textAlign: "left", marginBottom: "5px"}}>
        <Button color="primary" size="small" style={{marginRight: "10px"}} onClick={resetFilter}>
          <ClearIcon size={"small"}/> Clear Filters
        </Button>
        <Button color="primary" size="small"
                style={{marginRight: "10px", display: forceExpand ? "none": "inline-flex"}}
                onClick={() => setForceExpand(true)}
        >
          <ExpandMoreIcon size="small"/> Expand All Rows
        </Button>
        <Button color="primary" size="small"
                style={{marginRight: "10px", display: forceExpand ? "inline-flex": "none"}}
                onClick={() => setForceExpand(false)}
        >
          <ExpandLessIcon size="small"/> Close All Rows
        </Button>
        <Button color="primary" size="small" style={{marginRight: "10px"}}>
          <CloudDownloadIcon size="small"/><CSVLink data={data} filename={exportFilename} headers={headers} style={{verticalAlign: "center", color: "inherit", textDecoration: "none"}}>
            &nbsp;Download Results</CSVLink>
        </Button>
      </div>
      <TableContainer component={Paper} ref={toolbarRef}>
        <div style={{width: "99.5%"}}>
        <Table aria-label="collapsible table" style={{margin: "auto"}}>
          <CompanyTableHead
            classes={classes}
            order={order}
            onRequestSort={handleRequestSort}
            onFilterRows={handleFilterRows}
            filterValues={filterValues}
            maxSliderValue={maxSliderValue}
            filteredFilters={filteredFilters}
          />
          <TableBody key={"table-content-"+forceExpand}>
            {stableSort(data).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
              return (<Row key={row.name} row={row} forceExpand={forceExpand}/>)
            })}
          </TableBody>
        </Table>
        </div>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default CollapsibleTable;
