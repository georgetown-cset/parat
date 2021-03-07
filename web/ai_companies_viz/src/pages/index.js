import { Bar } from "react-chartjs-2";
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

  const data = {
    labels: ["A", "B", "C"],
    datasets: [
      {
        label: "The Awesome Graph",
        backgroundColor: ["rgba(255,99,132,0.2)", "rgba(155,99,132,0.2)", "rgba(55,99,132,0.2)"],
        borderColor: ["rgba(255,99,132,1)", "rgba(155,99,132,1)", "rgba(55,99,132,1)"],
        borderWidth: 1,
        hoverBackgroundColor: ["rgba(255,99,132,0.4)", "rgba(155,99,132,0.4)", "rgba(55,99,132,0.4)"],
        hoverBorderColor: ["rgba(255,99,132,1)", "rgba(155,99,132,1)", "rgba(55,99,132,1)"],
        data: [65, 59, 80]
      }
    ]
  };
  const options = {
    scales: {
      yAxes: [{
        display: true,
        ticks: {
            suggestedMin: 0
        }
      }]
    }
  };
  return (
    <main>
      <div id="toolbar" style={{"margin": "20px"}}>
        <a href={"https://cset.georgetown.edu"} target="_blank" title="Link to CSET website, cset.georgetown.edu">
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
          <Typography variant={"h6"} gutterBottom>By Zachary Arnold and Rebecca Gelles</Typography>
          <Typography variant={"subtitle2"} gutterBottom>Web design by Jennifer Melot</Typography>
        </div>
        <Typography variant={"body1"} paragraph>
        The AI Companies Tracker is ... link to relevant reports ... link to export
        </Typography>
        <Typography variant={"body2"} paragraph>
          The authors would like to thank...
        </Typography>
      </div>
      <div id="graph_container" style={{"backgroundColor": "#FFFFFF", "padding": "10px 10px"}}>
        <div style={{width: "30%"}}>
          <Bar data={data} options={options}/>
        </div>
        <div style={{"padding": "10px 50px"}}>
          <CollapsibleTable/>
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
  { id: "ai_patents", numeric: true, disablePadding: false, label: "Patents" },
];

function EnhancedTableHead(props) {
  const { classes, order, orderBy, onRequestSort, onFilterRows } = props;
  const companyNames = company_data.map(company => company.name).sort();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
            headCell.id === "name" ?
              <TableCell
                key={headCell.id}
                align={"left"}
                width={headCell.id === "name" ? "30%" : ""}
                padding={headCell.disablePadding ? "none" : "default"}
                colSpan={2}
              >
                <Autocomplete
                  id="company-name-search"
                  options={companyNames}
                  style={{ width: 300, marginLeft:"20px" }}
                  size="small"
                  renderInput={(params) => <TextField {...params} label="Company Name"/>}
                  onChange={onFilterRows}
                 />
              </TableCell>
              :
              <TableCell
                key={headCell.id}
                align={headCell.id.startsWith("ai_") ? "right" : "left"}
                width={headCell.id === "name" ? "30%" : ""}
                padding={headCell.disablePadding ? "none" : "default"}
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
              <div>
                <Typography variant="h6" gutterBottom component="div">
                  <Link href={row.website} target="_blank">{row.name}</Link>
                </Typography>
                <Typography variant="subtitle2" gutterBottom component="div">
                  {row.aliases}
                </Typography>
                {row.crunchbase.crunchbase_url &&
                  <Typography variant="subtitle2" gutterBottom component="div">
                    Crunchbase: <Link href={row.crunchbase.crunchbase_url}>{row.crunchbase.crunchbase_uuid}</Link>
                  </Typography>
                }
                {row.grid_info &&
                  <Typography variant="subtitle2" gutterBottom component="div">
                    GRID: <Link href={row.grid_info}>{row.grid_info}</Link>
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
              <Typography variant="p" gutterBottom component="div">
                {row.short_description}
              </Typography>
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

  const handleFilterRows = (event, name) => {
    if(name === undefined || name === null || name === ""){
      setData(company_data.slice(0));
    } else {
      setData(company_data.slice(0).filter(datum => datum.name === name));
    }
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
