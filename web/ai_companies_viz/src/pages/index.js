import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";

import cset_logo from "../images/cset_logo.svg";
import "../styles/styles.css";

const CollapsibleTable = React.lazy(() => import("./table"));


const IndexPage = () => {

  useEffect(() => {
    document.title = "CSET AI Companies Tracker";
    document.documentElement.lang = "en";
  }, []);

  // thank you https://stackoverflow.com/a/63066975
  const isSSR = typeof window === "undefined";

  return (
    <main>
      <div id="toolbar" style={{"margin": "20px"}}>
        <a href={"https://cset.georgetown.edu"} target="_blank" rel="noreferrer" title="Link to CSET website, cset.georgetown.edu">
          <img src={cset_logo} style={{"width": "300px"}} alt="CSET Logo"/>
        </a>
        <Button variant="contained"
                color="primary"
                style={{"float": "right"}}
                href="https://docs.google.com/forms/d/e/1FAIpQLSdMNP7fg3_HkIdKh_IZBksm6vZCbzb1cRZS-sdeLL5i3yxi_g/viewform"
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
      <div style={{padding: "10px 50px", backgroundColor: "#FFFFFF"}} id="table-container">
        {!isSSR && (
          <React.Suspense fallback={<div style={{textAlign: "center"}}><CircularProgress/></div>}>
            <CollapsibleTable/>
          </React.Suspense>
        )}
        <div style={{textAlign: "center", fontSize: "80%", marginBottom: "20px"}}>
          Powered by <Link href={"https://www.crunchbase.com/"} target="_blank" rel="noreferrer">Crunchbase</Link>, <Link href={"https://material-ui.com/"} target="_blank" rel="noreferrer">Material-UI</Link>, <Link href={"https://www.gatsbyjs.com/"} target="_blank" rel="noreferrer">GatsbyJS</Link>, and <Link href={"https://www.chartjs.org/"} target="_blank" rel="noreferrer">Chart.js</Link>.
        </div>
      </div>
    </main>
  )
};


export default IndexPage;
