import { Bar, Line } from "react-chartjs-2";
import React, { useEffect } from "react";
import pageStyles from "./styles";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete"
import Box from "@material-ui/core/Box";
import Button from '@material-ui/core/Button';
import Collapse from "@material-ui/core/Collapse";
import Link from "@material-ui/core/Link";
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
import SearchIcon from "@material-ui/icons/Search";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import PropTypes from "prop-types";

import {company_data} from "./data"
import cset_logo from "../images/cset_logo.svg";
import "../styles/styles.css";


const IndexPage = () => {

  useEffect(() => {
    document.title = "CSET AI Companies Tracker";
    document.documentElement.lang = "en";
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
          The authors would like to thank...
        </Typography>
      </div>
      <DataContainer data={company_data}/>
    </main>
  )
};

function DataContainer(props) {
  const data = props;
  const [pubtype_to_bins, setPubtypeToBins] = React.useState(updateSummaryGraphData());

  const ai_pubs_data = {
    labels: pubtype_to_bins["ai_pubs"]["labels"],
    datasets: [
      {
        label: "Pubs",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: pubtype_to_bins["ai_pubs"]["counts"]
      }
    ]
  };
  const top_ai_pubs_data = {
    labels: pubtype_to_bins["ai_pubs_in_top_conferences"]["labels"],
    datasets: [
      {
        label: "Top pubs",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: pubtype_to_bins["ai_pubs_in_top_conferences"]["counts"]
      }
    ]
  };
  const ai_patents_data = {
    labels: pubtype_to_bins["ai_pubs"]["labels"],
    datasets: [
      {
        label: "AI patents",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: pubtype_to_bins["ai_patents"]["counts"]
      }
    ]
  };
  const ai_pubs_options = {
    title: {
      display: true,
      text: "Company AI Publication Counts"
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
          labelString: "# Companies",
          display: true,
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: "# Publications",
          display: true,
        }
      }]
    }
  };
  const top_ai_pubs_options = {
    title: {
      display: true,
      text: "Company AI Publications in Top Conferences Counts"
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
          labelString: "# Companies",
          display: true,
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: "# Publications",
          display: true,
        }
      }]
    }
  };
  const ai_patents_options = {
    title: {
      display: true,
      text: "Company AI Patents Counts"
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
          labelString: "# Companies",
          display: true,
        }
      }],
      xAxes: [{
        scaleLabel: {
          labelString: "# Patents",
          display: true,
        }
      }]
    }
  };

  function updateSummaryGraphData(){
    const pubtype_to_bins_update = {};
    for(let key of ["ai_pubs", "ai_pubs_in_top_conferences", "ai_patents"]) {
      const rel_data = [];
      for (let company_info of company_data) {
        rel_data.push(company_info[key]);
      }
      const max = Math.max(...rel_data);
      const min = Math.min(...rel_data);
      const num_bins = 11;//Math.round(Math.pow(rel_data.length, 1/3));
      const bin_size = 100;//Math.round((max - min) / num_bins);
      const bin_counts = [];
      const bin_labels = [];
      for (let i = 0; i < num_bins; i++) {
        bin_counts.push(0);
        bin_labels.push((bin_size * i) + "-" + (bin_size * (i + 1) - 1));
      }
      bin_labels[bin_labels.length-1] += "+";
      for (let amt of rel_data) {
        const bin_idx = Math.min(Math.floor(amt / bin_size), num_bins-1);
        bin_counts[bin_idx] += 1;
      }
      pubtype_to_bins_update[key] = {
        "counts": bin_counts,
        "labels": bin_labels
      }
    }
    return pubtype_to_bins_update;
  }

  return (
    <div id="graph_container" style={{"backgroundColor": "#FFFFFF", "padding": "10px 10px"}}>
      <div id="summary-bars" style={{"padding": "10px 50px"}}>
        <div style={{width: "33%", display: "inline-block"}}>
          <Bar data={ai_pubs_data} options={ai_pubs_options}/>
        </div>
        <div style={{width: "33%", display: "inline-block"}}>
          <Bar data={top_ai_pubs_data} options={top_ai_pubs_options}/>
        </div>
        <div style={{width: "33%", display: "inline-block"}}>
          <Bar data={ai_patents_data} options={ai_patents_options}/>
        </div>
      </div>
      <div style={{"padding": "10px 50px"}}>
        <CollapsibleTable/>
      </div>
    </div>
  )
}

// much thanks due to the examples here https://material-ui.com/components/tables/
const headCells = [
  { id: "name", numeric: false, disablePadding: true, label: "Company Name" },
  { id: "country", numeric: false, disablePadding: false, label: "Country" },
  { id: "stage", numeric: false, disablePadding: false, label: "Company Stage" },
  { id: "ai_pubs", numeric: true, disablePadding: false, label: "AI Publications" },
  { id: "ai_pubs_in_top_conferences", numeric: true, disablePadding: false, label: "AI Publications in Top Conferences" },
  { id: "ai_patents", numeric: true, disablePadding: false, label: "Patents" },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, onFilterRows } = props;
  const companyNames = company_data.map(company => company.name).sort();
  const countries = [... new Set(company_data.map(company => company.country).filter(c => c !== null))].sort();
  const stages = [... new Set(company_data.map(company => company.stage).filter(c => c !== null))].sort();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  function handleNameFilter(evt, name){
    onFilterRows("name", [name]);
  }

  function handleCountryFilter(evt, name){
    onFilterRows("country", [name]);
  }

  function handleStageFilter(evt, name){
    onFilterRows("stage", [name]);
  }

  return (
    <TableHead>
      <TableRow>
        <TableCell
          key={"name"}
          align={"left"}
          width={"20%"}
          padding={"none"}
          colSpan={2}
        >
          <Autocomplete
            id="company-name-search"
            options={companyNames}
            style={{ width: 300, marginLeft:"20px" }}
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
            id="country-search"
            options={countries}
            style={{ width: 300, marginLeft:"20px" }}
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
            id="stage-search"
            options={stages}
            style={{ width: 300, marginLeft:"20px" }}
            size="small"
            renderInput={(params) => <TextField {...params} label="Stage"/>}
            onChange={handleStageFilter}
           />
        </TableCell>
        {headCells.map((headCell) => (
            headCell.id.startsWith("ai_") &&
              <TableCell
                key={headCell.id}
                align={"right"}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                  </span>
                  ) : null}
                </TableSortLabel>
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
      },
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
    }
  };

  return (
    <React.Fragment>
      <TableRow style={{borderBottom: "unset", cursor: "pointer"}} onClick={() => setOpen(!open)}>
        <TableCell>
          {row.local_logo !== null &&
            <img src={require("../images/" + row.local_logo)} style={{height: "30px"}}/>
          }
        </TableCell>
        <TableCell component="th" scope="row">{row.name}</TableCell>
        <TableCell align="left">{row.country}</TableCell>
        <TableCell align="left">{row.stage}</TableCell>
        <TableCell align="right">{row.ai_pubs}</TableCell>
        <TableCell align="right">{row.ai_pubs_in_top_conferences}</TableCell>
        <TableCell align="right">{row.ai_patents}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <div style={{marginBottom: "10px"}}>
                <div style={{width: "60%", display: "inline-block"}}>
                  <Typography variant="h6" gutterBottom component="div">
                    <Link href={row.website} target="_blank" rel="noreferrer">{row.name}</Link>
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom component="div">
                    {row.aliases}
                  </Typography>
                  <Typography variant="p" gutterBottom component="div" style={{marginTop: "10px"}}>
                    {row.short_description}
                  </Typography>
                </div>
                <div style={{width: "35%", display: "inline-block", verticalAlign:"top", backgroundColor: "#fffff9", padding: "10px 20px"}}>
                  {row.crunchbase.crunchbase_url &&
                    <Typography variant="subtitle2" gutterBottom component="div">
                      <Link href={row.crunchbase.crunchbase_url} target="_blank" rel="noreferrer">Crunchbase</Link>
                    </Typography>
                  }
                  {row.grid_info &&
                    <Typography variant="subtitle2" gutterBottom component="div">
                      GRID: {row.grid_info}
                    </Typography>
                  }
                  {row.permid_info &&
                    <Typography variant="subtitle2" gutterBottom component="div">
                      PermID: {row.permid_info}
                    </Typography>
                  }
                  {row.parent_info &&
                    <Typography variant="subtitle2" gutterBottom component="div">
                      {row.parent_info}
                    </Typography>
                  }
                  {row.child_info &&
                    <Typography variant="subtitle2" gutterBottom component="div">
                      {row.child_info}
                    </Typography>
                  }
                </div>
              </div>
              <div>
                <div style={{width: "33%", display: "inline-block"}}>
                  <Line data={pubs_data} options={pubs_options}/>
                </div>
                <div style={{width: "33%", display: "inline-block"}}>
                  <Line data={top_pubs_data} options={top_pubs_options}/>
                </div>
                <div style={{width: "33%", display: "inline-block"}}>
                  <Line data={patents_data} options={patents_options}/>
                </div>
              </div>
            </Box>
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
    ai_pubs: PropTypes.number.isRequired,
    ai_pubs_in_top_conferences: PropTypes.number.isRequired,
    ai_patents: PropTypes.number.isRequired,
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
  const [keyToSelected, setKeyToSelected] = React.useState({
    "country": [],
    "stage": [],
    "name": []
  });

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
  };

  const handleFilterRows = (key, filters) => {
    const clean_filters = filters.filter(k => (k !== null) && (k !== ""));
    const updatedKeyToSelected = {...keyToSelected};
    updatedKeyToSelected[key] = clean_filters;
    setKeyToSelected(updatedKeyToSelected);

    const filtered_data = [];
    for(let datum of company_data) {
      let include = true;
      for (let key in updatedKeyToSelected) {
        if ((updatedKeyToSelected[key].length !== 0) && !updatedKeyToSelected[key].includes(datum[key])) {
          include = false;
        }
      }
      if(include){
        filtered_data.push(datum);
      }
    }
    setData(filtered_data);
  };

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
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
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  return (
    <div>
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
