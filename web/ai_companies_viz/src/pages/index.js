import { Bar } from "react-chartjs-2";
import React from "react";
import pageStyles from "./styles";
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import PropTypes from 'prop-types';

import {company_data} from "./data"

const IndexPage = () => {
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
    <main style={pageStyles}>
      Hello world. This is a graph.
      <Bar data={data} options={options} style={{height: "400px"}}/>
      <CollapsibleTable/>
    </main>
  )
};

function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow style={{borderBottom: "unset"}}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.country}</TableCell>
        <TableCell align="right">Big</TableCell>
        <TableCell align="right">{row.ai_pubs}</TableCell>
        <TableCell align="right">{row.ai_pubs_in_top_conferences}</TableCell>
        <TableCell align="right">{row.ai_patents}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom component="div">
                Detail
              </Typography>
              <Typography variant="p" gutterBottom component="div">
                Lorem ipsum
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
    //size: PropTypes.string.isRequired,
    ai_pubs: PropTypes.number.isRequired,
    ai_pubs_in_top_conferences: PropTypes.number.isRequired,
    ai_patents: PropTypes.number.isRequired,
    //description: PropTypes.string.isRequired,
  }).isRequired,
};

const CollapsibleTable = () => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell/>
              <TableCell>Company Name</TableCell>
              <TableCell align="right">Country</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">AI Publications</TableCell>
              <TableCell align="right">AI Publications in Top Conferences</TableCell>
              <TableCell align="right">AI Patents</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {company_data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(row => {
              return (<Row key={row.name} row={row} />)
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 20, 100]}
        component="div"
        count={company_data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default IndexPage;
