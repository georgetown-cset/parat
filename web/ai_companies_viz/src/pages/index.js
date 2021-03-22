import { Line, defaults } from "react-chartjs-2";
import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete"
import Button from '@material-ui/core/Button';
import Collapse from "@material-ui/core/Collapse";
import Link from "@material-ui/core/Link";
import Slider from "@material-ui/core/Slider";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import "chartjs-plugin-annotation";

import {company_data} from "../static_data/data.js"
import cset_logo from "../images/cset_logo.svg";
import "../styles/styles.css";

// https://sevketyalcin.com/blog/responsive-charts-using-Chart.js-and-react-chartjs-2/
defaults.global.maintainAspectRatio = false;


const IndexPage = () => {

  useEffect(() => {
    document.title = "CSET AI Companies Tracker";
    document.documentElement.lang = "en";
    document.getElementById("table-container").style.visibility="visible";
  }, []);


  return (
    <main>
      <div id="toolbar" style={{"margin": "20px"}}>
        <a href={"https://cset.georgetown.edu"} target="_blank" rel="noreferrer" title="Link to CSET website, cset.georgetown.edu">
          <img src={cset_logo} style={{"width": "300px"}} alt="CSET Logo"/>
        </a>
        <Button variant="contained"
                color="primary"
                style={{"float": "right"}}
                href="tbd"
                target="_blank">
          Questions and Submissions
        </Button>
      </div>
      <div id="project-description" style={{"margin": "50px 100px"}}>
        <div id="description-header" style={{"marginBottom": "30px"}}>
          <Typography variant={"h4"} gutterBottom>AI Companies Tracker</Typography>
          <Typography variant={"h6"} gutterBottom>By Zach & Rebecca</Typography>
          <Typography variant={"subtitle2"} gutterBottom>Web design by Jennifer Melot</Typography>
        </div>
        <Typography variant={"body1"} paragraph>
        The AI Companies Tracker is ... link to relevant reports ... link to export
        </Typography>
        <Typography variant={"body2"} paragraph>
          The authors would like to thank... Ben Murphy and Yanqi Ding.
        </Typography>
      </div>
      <div style={{padding: "10px 50px", backgroundColor: "#FFFFFF", visibility: "hidden"}} id="table-container">
        <CollapsibleTable/>
        <div style={{textAlign: "center", fontSize: "80%", marginBottom: "20px"}}>
          Powered by <Link href={"https://www.crunchbase.com/"} target="_blank" rel="noreferrer">Crunchbase</Link>, <Link href={"https://material-ui.com/"} target="_blank" rel="noreferrer">Material-UI</Link>, <Link href={"https://www.gatsbyjs.com/"} target="_blank" rel="noreferrer">GatsbyJS</Link>, and <Link href={"https://www.chartjs.org/"} target="_blank" rel="noreferrer">Chart.js</Link>.
        </div>
      </div>
    </main>
  )
};

// much thanks due to the examples here https://material-ui.com/components/tables/
const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Company Name" },
  { id: "country", numeric: false, disablePadding: false, label: "Country" },
  { id: "stage", numeric: false, disablePadding: false, label: "Company Stage" },
  { id: "ai_pubs", numeric: true, disablePadding: false, label: "AI Publications" },
  { id: "ai_pubs_in_top_conferences", numeric: true, disablePadding: false, label: "AI Publications in Top Conferences" },
  { id: "ai_patents", numeric: true, disablePadding: false, label: "AI Patents" },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, onFilterRows } = props;
  const companyNames = company_data.map(company => company.name).sort();
  const countries = [...new Set(company_data.map(company => company.country).filter(c => c !== null))].sort();
  const stages = [...new Set(company_data.map(company => company.stage).filter(c => c !== null))].sort();
  const maxSliderValue = 100;
  const [sliderValues, setSliderValues] = React.useState({
    "ai_pubs": [0, maxSliderValue],
    "ai_pubs_in_top_conferences": [0, maxSliderValue],
    "ai_patents": [0, maxSliderValue]
  });
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  function handleNameFilter(evt, name){
    onFilterRows("name", [name]);
  }

  function handleCountryFilter(evt, name){
    onFilterRows("country", [...name]);
  }

  function handleStageFilter(evt, name){
    onFilterRows("stage", [...name]);
  }

  function handleSliderChange(evt, newRange, metric) {
    const updatedSliders = {...sliderValues};
    updatedSliders[metric] = newRange;
    setSliderValues(updatedSliders);
    // hackily, replace the "max" value with a very large value in the version of the
    // dict we send to onFilterRows
    const maxSliders = {};
    for(let key in updatedSliders){
      maxSliders[key] = [updatedSliders[key][0],
        updatedSliders[key][1] === maxSliderValue ? 100000000 : updatedSliders[key][1]];
    }
    onFilterRows("sliders", maxSliders);
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
            id="company-name-search"
            options={companyNames}
            style={{ minWidth: "200px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Company Name"/>}
            onChange={handleNameFilter}
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
            options={countries}
            style={{ minWidth: "150px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Country"/>}
            onChange={handleCountryFilter}
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
            options={stages}
            style={{ minWidth: "70px", paddingLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Stage"/>}
            onChange={handleStageFilter}
           />
        </TableCell>
        {headCells.map((headCell) => (
            headCell.id.startsWith("ai_") &&
              <TableCell
                key={headCell.id}
                align={"center"}
                style={{ width: "150px", verticalAlign: "bottom" }}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                  style={{padding: "0 0 0 10px"}}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </span>
                  ) : null}
                </TableSortLabel>
                <Slider
                  value={sliderValues[headCell.id]}
                  onChange={(evt, newRange) => handleSliderChange(evt, newRange, headCell.id)}
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

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
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
            suggestedMin: 0
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
        label: "Publications in top AI Conferences",
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
            suggestedMin: 0
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
            suggestedMin: 0
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
      e.target.innerHTML="Hide Linkages";
      setLinkageElevation(2);
    } else{
      e.target.innerHTML="Show Linkages";
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0}} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <div style={{padding: "10px"}}>
              <div style={{marginBottom: "10px"}}>
                <div style={{width: "60%", display: "inline-block"}}>
                  <div>
                  <Typography variant="h6" gutterBottom component="span">
                    <Link href={row.website} target="_blank" rel="noreferrer">{row.name}</Link>
                  </Typography>
                  {row.market && <span style={{paddingLeft: "10px", color: "#545454"}}>{row.market}</span>}
                  </div>
                  <Typography variant="subtitle2" gutterBottom component="div">
                    {row.aliases}
                  </Typography>
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
                </div>
                <div style={{width: "35%", display: "inline-block", verticalAlign:"top", marginLeft: "30px"}}>
                  <Paper elevation={linkageElevation} style={{padding: "10px 20px"}}>
                  <div style={{marginBottom: "10px", textAlign: "center"}}>
                    <Button color="primary" size="small"
                            style={{marginRight: "10px"}} onClick={toggleLinkageVisibility}>
                      Show Linkages
                    </Button>
                    {row.crunchbase.crunchbase_url &&
                      <Link href={row.crunchbase.crunchbase_url} target="_blank" rel="noreferrer">
                        <Button color="secondary" size="small">View on Crunchbase</Button>
                      </Link>
                    }
                  </div>
                  {linkageVisible &&
                  <div>
                    {row.grid_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>GRID:</span> {row.grid_info}
                    </Typography>
                    }
                    {row.permid_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>PermID:</span> {row.permid_info}
                    </Typography>
                    }
                    {row.parent_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>Parents:</span> {row.parent_info}
                    </Typography>
                    }
                    {row.agg_child_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>Included Subsidiaries:</span> {row.agg_child_info}
                    </Typography>
                    }
                    {row.unagg_child_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>Excluded Subsidiaries:</span> {row.unagg_child_info}
                    </Typography>
                    }
                    {!(row.grid_info || row.permid_info || row.parent_info || row.agg_child_info || row.unagg_child_info) &&
                    <Typography variant="body2" gutterBottom component="p" style={{textAlign: "center"}}>
                      No linkage information available.
                    </Typography>
                    }
                  </div>
                  }
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
  const [orderBy, setOrderBy] = React.useState("ai_pubs");
  const [order, setOrder] = React.useState("desc");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [data, setData] = React.useState(company_data.slice(0));
  const [keyToSelected, setKeyToSelected] = React.useState({});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  const handleFilterRows = (key, filters) => {
    let clean_filters = filters;
    if(key !== "sliders") {
      clean_filters = filters.filter(k => (k !== null) && (k !== ""));
    }
    const updatedKeyToSelected = {...keyToSelected};
    updatedKeyToSelected[key] = clean_filters;
    setKeyToSelected(updatedKeyToSelected);

    const filtered_data = [];
    for(let datum of company_data) {
      let include = true;
      for (let key in updatedKeyToSelected) {
        if(key === "sliders"){
          for (let metric in updatedKeyToSelected["sliders"]){
            const min_and_max = updatedKeyToSelected["sliders"][metric];
            if ((datum[metric]["value"] < min_and_max[0]) || (datum[metric]["value"] > min_and_max[1])){
              include = false;
            }
          }
        }
        else if ((updatedKeyToSelected[key].length !== 0) && !updatedKeyToSelected[key].includes(datum[key])) {
          include = false;
        }
      }
      if(include){
        filtered_data.push(datum);
      }
    }
    setData(filtered_data);
    setPage(0);
  };

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy]["value"] < a[orderBy]["value"]) {
      return -1;
    }
    if (b[orderBy]["value"] > a[orderBy]["value"]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1]["value"] - b[1]["value"];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  return (
    <div style={{minWidth: "800px", margin:"10px 1% 20px 1%", textAlign: "center"}}>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <EnhancedTableHead
            classes={classes}
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            onFilterRows={handleFilterRows}
          />
          <TableBody>
            {stableSort(data, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
              return (<Row key={row.name} row={row} />)
            })}
          </TableBody>
        </Table>
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

export default IndexPage;
