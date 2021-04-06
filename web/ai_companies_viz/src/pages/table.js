// much thanks due to the examples here https://material-ui.com/components/tables/
import React from "react";
import {company_data} from "../static_data/data";
import {tooltips} from "../static_data/tooltips";
import HelpIcon from "@material-ui/icons/Help";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Autocomplete from "@material-ui/lab/Autocomplete/Autocomplete";
import TextField from "@material-ui/core/TextField/TextField";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import Slider from "@material-ui/core/Slider";
import PropTypes from "prop-types";
import Tooltip from "@material-ui/core/Tooltip";
import Collapse from "@material-ui/core/Collapse/Collapse";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper/Paper";
import Button from "@material-ui/core/Button";
import {defaults, Line} from "react-chartjs-2";
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

// https://sevketyalcin.com/blog/responsive-charts-using-Chart.js-and-react-chartjs-2/
defaults.global.maintainAspectRatio = false;


const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Company Name" },
  { id: "country", numeric: false, disablePadding: false, label: "Country" },
  { id: "continent", numeric: false, disablePadding: false, label: "Continent" },
  { id: "stage", numeric: false, disablePadding: false, label: "Company Stage" },
  { id: "ai_pubs", numeric: true, disablePadding: false, label: "AI Publications" },
  { id: "ai_pubs_in_top_conferences", numeric: true, disablePadding: false, label: "AI Publications in Top Conferences" },
  { id: "ai_patents", numeric: true, disablePadding: false, label: "AI Patents" },
];

function EnhancedTableHead(props) {
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
            renderInput={(params) => <TextField {...params} label="Continent"/>}
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
                style={{ width: "150px", verticalAlign: "bottom" }}
                sortDirection={order[headCell.id] === 1 ? "asc" : "desc"}
              >
                <TableSortLabel
                  active={true}
                  direction={order[headCell.id] === 1 ? "desc" : "asc"}
                  onClick={createSortHandler(headCell.id)}
                  style={{padding: "0 0 0 10px"}}
                  hideSortIcon={true}
                >
                  {headCell.label}
                </TableSortLabel>
                <Slider
                  value={filterValues[headCell.id]}
                  onChange={(evt, newRange) => handleFilter(evt, newRange, headCell.id)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={valueLabelFormat}
                  aria-labelledby="range-slider"
                />
              </TableCell>
          ))
        }
      </TableRow>
    </TableHead>
  );
}

function Row(props) {
  const { row, forceExpand } = props;
  const [open, setOpen] = React.useState(forceExpand);
  const [linkageVisible, setLinkageVisible] = React.useState(false);
  const [linkageElevation, setLinkageElevation] = React.useState(0);

  const pubs_data = {
    labels: row.years,
    datasets: [
      {
        label: "All Publications",
        data: row.yearly_all_publications,
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "rgba(100,100,100,0.5)"
      },
      {
        label: "All AI Publications",
        data: row.yearly_ai_publications,
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "rgba(0,0,255,0.5)"
      },
    ]
  };
  const pubs_options = {
    title: {
      display: true,
      text: "Publications by Year"
    },
    legend: {
      position: "top",
      labels: {
        "boxWidth": 1
      }
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          labelString: "# Publications",
          display: true,
        },
        ticks: {
            suggestedMin: 0,
            precision: 0
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: "Year",
          display: true,
        },
      }]
    },
    annotation: {
      annotations: [{
         type: "box",
         yScaleID: "y-axis-0",
         xScaleID: "x-axis-0",
         xMin: new Date().getFullYear()-1,
         xMax: new Date().getFullYear(),
         backgroundColor: "rgba(100,100,100,0.1)",
         borderColor: "rgba(0,0,0,0)"
      }]
   }
  };
  const top_pubs_data = {
    labels: row.years,
    datasets: [
      {
        label: "Publications in Top AI Conferences",
        data: row.yearly_ai_pubs_top_conf,
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "rgba(0,0,255,0.5)"
      },
    ]
  };
  const top_pubs_options = {
    title: {
      display: true,
      text: "Publications in Top AI Conferences by Year"
    },
    legend: {
      position: "top",
      labels: {
        "boxWidth": 1
      }
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          labelString: "# Publications",
          display: true,
        },
        ticks: {
            suggestedMin: 0,
            precision: 0
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: "Year",
          display: true,
        },
      }]
    },
    annotation: {
      annotations: [{
         type: "box",
         yScaleID: "y-axis-0",
         xScaleID: "x-axis-0",
         xMin: new Date().getFullYear()-1,
         xMax: new Date().getFullYear(),
         backgroundColor: "rgba(100,100,100,0.1)",
         borderColor: "rgba(0,0,0,0)"
      }]
   }
  };
  const patents_data = {
    labels: row.years,
    datasets: [
      {
        label: "AI Patents",
        data: row.yearly_ai_patents,
        backgroundColor: "rgba(0,0,0,0)",
        borderColor: "rgba(0,0,255,0.5)"
      }
    ]
  };
  const patents_options = {
    title: {
      display: true,
      text: "AI Patents by Year"
    },
    legend: {
      display: true,
      position: "top",
      labels: {
        "boxWidth": 1
      }
    },
    scales: {
      yAxes: [{
        scaleLabel: {
          labelString: "# Patents",
          display: true,
        },
        ticks: {
            suggestedMin: 0,
            precision: 0
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: "Year",
          display: true,
        },
      }]
    },
    annotation: {
      annotations: [{
         type: "box",
         yScaleID: "y-axis-0",
         xScaleID: "x-axis-0",
         xMin: new Date().getFullYear()-3,
         xMax: new Date().getFullYear(),
         backgroundColor: "rgba(100,100,100,0.1)",
         borderColor: "rgba(0,0,0,0)"
      }]
   }
  };

  function toggleLinkageVisibility(e){
    const newVisibility = !linkageVisible;
    if(newVisibility){
      e.target.innerHTML="Show Less Metadata";
      setLinkageElevation(2);
    } else{
      e.target.innerHTML="Show More Metadata";
      setLinkageElevation(0);
    }
    setLinkageVisible(newVisibility);
  }

  return (
    <React.Fragment>
      <TableRow style={{borderBottom: "unset", cursor: "pointer"}} onClick={() => setOpen(!open)}>
        <TableCell>
          {row.local_logo !== null &&
            <img src={require("../images/" + row.local_logo)} style={{height: "30px"}} alt={row.name}/>
          }
        </TableCell>
        <TableCell component="th" scope="row">{row.name}</TableCell>
        <TableCell align="left">{row.country}</TableCell>
        <TableCell align="left">{row.continent}</TableCell>
        <TableCell align="left">{row.stage}</TableCell>
        <TableCell align="right">
          <div style={{marginRight: "5px", display:"inline-block", color:"hsl(19, 85%, "+(row.ai_pubs.frac_of_max*62)+"%)"}}>{row.ai_pubs.value}</div>
          <div style={{color: "darkgrey", width: "30px", display:"inline-block", textAlign: "right", marginRight: "20px"}}>#{row.ai_pubs.rank}</div>
        </TableCell>
        <TableCell align="right">
          <div style={{marginRight: "5px", display:"inline-block", color:"hsl(19, 85%, "+(row.ai_pubs_in_top_conferences.frac_of_max*62)+"%)"}}>{row.ai_pubs_in_top_conferences.value}</div>
          <div style={{color: "darkgrey", width: "30px", display:"inline-block", textAlign: "right", marginRight: "20px"}}>#{row.ai_pubs_in_top_conferences.rank}</div>
        </TableCell>
        <TableCell align="right">
          <div style={{marginRight: "5px", display:"inline-block", color:"hsl(19, 85%, "+(row.ai_patents.frac_of_max*62)+"%)"}}>{row.ai_patents.value}</div>
          <div style={{color: "darkgrey", width: "30px", display:"inline-block", textAlign: "right", marginRight: "20px"}}>#{row.ai_patents.rank}</div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div style={{padding: "10px"}}>
              <div style={{marginBottom: "10px"}}>
                <div style={{width: "60%", display: "inline-block"}}>
                  <div>
                  <Typography variant="h6" gutterBottom component="span">
                    <Link href={row.website} target="_blank" rel="noreferrer">{row.name}</Link>
                  </Typography>
                  {row.market.map( m => (
                    <span style={{paddingLeft: "10px", color: "#545454"}}>
                      {m.link ?
                        <Link href={m.link} target="blank" rel="noreferrer">{m.market_key}</Link>
                        : <span>{m.market_key}</span>
                      }
                    </span>
                  ))}
                  </div>
                  {row.crunchbase_description && row.crunchbase_description.length > 0 &&
                  <Typography variant="body2" gutterBottom component="div" style={{marginTop: "10px"}}>
                    "{row.crunchbase_description}" <span style={{fontSize: "75%", marginLeft: "10px"}}>Crunchbase</span>
                  </Typography>
                  }
                  {row.wikipedia_description && row.wikipedia_description.length > 0 &&
                  <Typography variant="body2" gutterBottom component="div" style={{marginTop: "10px"}}>
                    "{row.wikipedia_description}"
                    <span style={{fontSize: "75%", marginLeft: "10px"}}><a href={row.wikipedia_link} target="blank" rel="noreferrer">Wikipedia</a>, retrieved {row.description_retrieval_date}</span>
                  </Typography>
                  }
                  {row.company_site_description && row.company_site_description.length > 0 &&
                  <Typography variant="body2" gutterBottom component="div" style={{marginTop: "10px"}}>
                    "{row.company_site_description}"
                    <span style={{fontSize: "75%", marginLeft: "10px"}}><a href={row.company_site_link} target="blank" rel="noreferrer">Source</a>, retrieved {row.description_retrieval_date}</span>
                  </Typography>
                  }
                  {row.company_site_description_translation && row.company_site_description.length > 0 &&
                  <Typography variant="body2" gutterBottom component="div" style={{marginTop: "10px"}}>
                    "{row.company_site_description_translation}"
                    <span style={{fontSize: "75%", marginLeft: "10px"}}><a href={row.company_site_link} target="blank" rel="noreferrer">Google Translation of source</a>, retrieved {row.description_retrieval_date}</span>
                  </Typography>
                  }
                </div>
                <div style={{width: "35%", display: "inline-block", verticalAlign:"top", marginLeft: "30px"}}>
                  <Paper elevation={linkageElevation} style={{padding: "10px 20px"}}>
                  {row.aliases &&
                    <Typography variant="body2" gutterBottom component="div">
                      <span style={{fontWeight: "bold"}}>Aliases:</span> {row.aliases}
                    </Typography>
                  }
                  {linkageVisible &&
                  <div>
                    {row.grid_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.grid}</h2>}><span style={{fontWeight: "bold"}}>GRID<HelpIcon fontSize={"inherit"}/></span></Tooltip>: {row.grid_info}
                    </Typography>
                    }
                    {row.permid_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.permid}</h2>}><span style={{fontWeight: "bold"}}>PermID<HelpIcon fontSize={"inherit"}/></span></Tooltip>: {row.permid_info}
                    </Typography>
                    }
                    {row.parent_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>Parents:</span> {row.parent_info}
                    </Typography>
                    }
                    {row.agg_child_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.included_subsidiaries}</h2>}><span style={{fontWeight: "bold"}}>Included Subsidiaries<HelpIcon fontSize={"inherit"}/></span></Tooltip>: {row.agg_child_info}
                    </Typography>
                    }
                    {row.unagg_child_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.excluded_subsidiaries}</h2>}><span style={{fontWeight: "bold"}}>Excluded Subsidiaries<HelpIcon fontSize={"inherit"}/></span></Tooltip>: {row.unagg_child_info}
                    </Typography>
                    }
                    {!(row.grid_info || row.permid_info || row.parent_info || row.agg_child_info || row.unagg_child_info) &&
                    <Typography variant="body2" gutterBottom component="p" style={{textAlign: "center"}}>
                      No additional metadata available.
                    </Typography>
                    }
                  </div>
                  }
                  <div style={{ textAlign: "center"}}>
                    <Button color="primary" size="small"
                            style={{marginRight: "10px"}} onClick={toggleLinkageVisibility}>
                      Show More Metadata
                    </Button>
                    {row.crunchbase.crunchbase_url &&
                      <Link href={row.crunchbase.crunchbase_url} target="_blank" rel="noreferrer">
                        <Button color="secondary" size="small">View on Crunchbase</Button>
                      </Link>
                    }
                  </div>
                  </Paper>
                </div>
              </div>
              <div style={{textAlign: "center"}}>
                <div style={{width: "33%", display: "inline-block", height: "100%", minHeight: "250px", minWidth: "300px"}}>
                  <Line data={pubs_data} options={pubs_options}/>
                </div>
                <div style={{width: "33%", display: "inline-block", height: "100%", minHeight: "250px", minWidth: "300px"}}>
                  <Line data={top_pubs_data} options={top_pubs_options}/>
                </div>
                <div style={{width: "33%", display: "inline-block", height: "100%", minHeight: "250px", minWidth: "300px"}}>
                  <Line data={patents_data} options={patents_options}/>
                </div>
              </div>
              <Typography variant="subtitle2" gutterBottom component="p" style={{textAlign: "right", fontSize: "90%"}}>
                Grey shaded regions of the graphs contain partial data.
              </Typography>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.shape({
    name: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    stage: PropTypes.string.isRequired,
    ai_pubs: PropTypes.object.isRequired,
    ai_pubs_in_top_conferences: PropTypes.object.isRequired,
    ai_patents: PropTypes.object.isRequired,
  }).isRequired,
};

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
    { label: "continent", key: "continent" },
    { label: "stage", key: "stage" },
    { label: "ai_pubs_since_2010", key: "ai_pubs.value" },
    { label: "ai_pubs_in_top_conf_since_2010", key: "ai_pubs_in_top_conferences.value" },
    { label: "ai_patents_since_2010", key: "ai_patents.value" },
    { label: "crunchbase_uuid", key: "crunchbase.crunchbase_uuid" },
    { label: "crunchbase_url", key: "crunchbase.crunchbase_url" },
    { label: "aliases", key: "aliases" },
    { label: "grid_ids", key: "grid_info" },
    { label: "permids", key: "permid_info" },
    { label: "parents", key: "parent_info" },
    { label: "included_subsidiaries", key: "agg_child_info" },
    { label: "excluded_subsidiaries", key: "unagg_child_info" },
  ];
  //const [exportFilename, setExportFilename] = React.useState("cset-carat-export.csv");
  const exportFilename = "cset-carat-export.csv";

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event, column_name) => {
    const updatedSortOrder = {...order};
    // flip the order from what it previously was
    updatedSortOrder[column_name] = -1*order[column_name];
    setOrder(updatedSortOrder);

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
    <div style={{minWidth: "800px", margin:"10px 1% 20px 1%", textAlign: "center"}}>
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
      <TableContainer component={Paper}>
        <div style={{width: "99.5%"}}>
        <Table aria-label="collapsible table" style={{margin: "auto"}}>
          <EnhancedTableHead
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
