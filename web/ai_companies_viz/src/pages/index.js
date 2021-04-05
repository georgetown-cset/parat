import React, { useEffect } from "react";
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from "@material-ui/core/Link";
import PropTypes from "prop-types";
import Typography from "@material-ui/core/Typography";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";

import cset_logo from "../images/cset_logo.svg";
import "../styles/styles.css";
import {tab_text} from "../static_data/text";

const CollapsibleTable = React.lazy(() => import("./table"));

function TabPanel(props) {
  const { value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      style={{padding: "0px 100px"}}
      {...other}
    >
      {value === index && (
        <div>
          <Typography dangerouslySetInnerHTML={tab_text[index]}></Typography>
        </div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    'aria-controls': `wrapped-tabpanel-${index}`,
  };
}

const IndexPage = () => {

  useEffect(() => {
    document.title = "CSET AI Companies Tracker";
    document.documentElement.lang = "en";
  }, []);

  // thank you https://stackoverflow.com/a/63066975
  const isSSR = typeof window === "undefined";

  const [selectedTab, setSelectedTab] = React.useState("overview");
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <main>
      <div>
        <div style={{margin: "20px"}}>
          <div style={{width: "80%", display: "inline-block"}}>
            <h2>Welcome to CARAT, CSET's tracker for private-sector AI activity.</h2>
            <p>
              CARAT collects data related to companies' AI research, development, and production activities
              in order to inform analysis of the global AI sector.
            </p>
          </div>
          <div style={{width: "20%", display: "inline-block", textAlign: "right", verticalAlign: "top"}}>
            <a href={"https://cset.georgetown.edu"} target="_blank" rel="noreferrer" title="Link to CSET website, cset.georgetown.edu">
                <img src={cset_logo} style={{"width": "300px"}} alt="CSET Logo"/>
            </a>
          </div>
        </div>
        <Tabs value={selectedTab} onChange={handleTabChange} orientation={"vertical"}
              style={{borderRight: "1px solid grey", display: "inline-block", width: "15%"}}>
          <Tab
            value="overview"
            label="CSET CARAT Overview"
            indicatorColor="primary"
            textColor="primary"
            {...a11yProps('overview')}
          />
          <Tab value="data_sources" label="Data Sources" {...a11yProps('data_sources')} />
          <Tab value="methodology" label="Methodology" {...a11yProps('methodology')} />
          <Tab value="faq" label="FAQ" {...a11yProps('faq')} />
          <Tab value="acknowledgements" label="Acknowledgements" {...a11yProps('acknowledgements')} />
        </Tabs>
        <div style={{display: "inline-block", width: "84%", verticalAlign: "top"}}>
          <TabPanel value={selectedTab} index="overview"/>
          <TabPanel value={selectedTab} index="data_sources"/>
          <TabPanel value={selectedTab} index="methodology"/>
          <TabPanel value={selectedTab} index="faq"/>
          <TabPanel value={selectedTab} index="acknowledgements"/>
        </div>
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
