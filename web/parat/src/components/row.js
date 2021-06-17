import React from "react";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Collapse from "@material-ui/core/Collapse/Collapse";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper/Paper";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import {tooltips} from "../static_data/tooltips";
import Button from "@material-ui/core/Button";
import {Line} from "react-chartjs-2";
import PropTypes from "prop-types";

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
            precision: 0,
            suggestedMax: getSuggestedMax(row.yearly_all_publications)
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
            precision: 0,
            suggestedMax: getSuggestedMax(row.yearly_ai_pubs_top_conf)
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
            precision: 0,
            suggestedMax: getSuggestedMax(row.yearly_ai_patents)
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

  function getSuggestedMax(ary){
    const max = Math.max(...ary);
    const maxes = [10, 50, 100, 250, 500, 750, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
    for(let m of maxes){
      if(max <= m){
        return m;
      }
    }
    return max + 500;
  }

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
            <img src={require("../images/" + row.local_logo)} style={{height: "30px", maxWidth: "100px"}} alt={row.name}/>
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
                  {row.market_filt.map( m => (
                    <span key={m.market_key} style={{paddingLeft: "10px", color: "#545454"}}>
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
                    <span style={{fontSize: "75%", marginLeft: "10px"}}>Google Translation of <a href={row.company_site_link} target="blank" rel="noreferrer">source</a>, retrieved {row.description_retrieval_date}</span>
                  </Typography>
                  }
                </div>
                <div style={{width: "37%", display: "inline-block", verticalAlign:"top", marginLeft: "30px"}}>
                  <Paper elevation={linkageElevation} style={{padding: "10px 20px"}}>
                  {row.aliases &&
                    <Typography variant="body2" gutterBottom component="div">
                      <span style={{fontWeight: "bold"}}>Aliases:</span> {row.aliases}
                    </Typography>
                  }
                  {linkageVisible &&
                  <div width={"100%"}>
                    {row.grid_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.grid}</h2>}>
                        <span style={{fontWeight: "bold", borderBottom: "1px dashed black"}}>GRID</span></Tooltip>: <span dangerouslySetInnerHTML={row.grid_links}/>
                    </Typography>
                    }
                    {row.permid_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.permid}</h2>}><span style={{fontWeight: "bold", borderBottom: "1px dashed black"}}>PermID</span></Tooltip>: <span dangerouslySetInnerHTML={row.permid_links}/>
                    </Typography>
                    }
                    {row.parent_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>Parents</span>: {row.parent_info}
                    </Typography>
                    }
                    {row.agg_child_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.included_subsidiaries}</h2>}><span style={{fontWeight: "bold", borderBottom: "1px dashed black"}}>Included Subsidiaries</span></Tooltip>: {row.agg_child_info}
                    </Typography>
                    }
                    {row.unagg_child_info &&
                    <Typography variant="body2" gutterBottom component="p">
                      <Tooltip title={<h2 style={{ lineHeight: "1.5" }}>{tooltips.excluded_subsidiaries}</h2>}><span style={{fontWeight: "bold", borderBottom: "1px dashed black"}}>Excluded Subsidiaries</span></Tooltip>: {row.unagg_child_info}
                    </Typography>
                    }
                    {row.full_market_links &&
                    <Typography variant="body2" gutterBottom component="p">
                      <span style={{fontWeight: "bold"}}>Market (full)</span>: <span dangerouslySetInnerHTML={row.full_market_links}/>
                    </Typography>
                    }
                    {!(row.grid_info || row.permid_info || row.parent_info || row.agg_child_info || row.unagg_child_info || row.full_market_links) &&
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

export default Row;
