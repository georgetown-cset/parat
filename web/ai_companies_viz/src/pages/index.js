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
      style={{padding: "0px 7%"}}
      {...other}
    >
      {value === index && (
        tab_text[index].map((para) =>
          <div style={{paddingBottom: "10px"}}>
            <Typography dangerouslySetInnerHTML={para}></Typography>
          </div>
        )
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
      <div style={{paddingBottom: "50px"}}>
        <div style={{margin: "20px 20px 30px 20px"}}>
          <div style={{width: "80%", marginLeft: "1%", display: "inline-block"}}>
            <h2>🥕 Welcome to CARAT, CSET's tracker for private-sector AI activity.</h2>
            <h3 style={{fontWeight: "normal"}}>
              CARAT collects data related to companies' AI research, development, and production activities
              in order to inform analysis of the global AI sector.
            </h3>
          </div>
          <div style={{width: "19%", display: "inline-block", textAlign: "right", verticalAlign: "top"}}>
            <a href={"https://cset.georgetown.edu"} target="_blank" rel="noreferrer" title="Link to CSET website, cset.georgetown.edu">
                <img src={cset_logo} style={{"width": "100%"}} alt="CSET Logo"/>
            </a>
          </div>
        </div>
        <div>
        <Tabs value={selectedTab} onChange={handleTabChange} orientation={"vertical"}
              style={{borderRight: "1px solid grey", width: "15%", display: "inline-block", minWidth: "160px"}}>
          <Tab
            value="overview"
            label="Overview"
            indicatorColor="primary"
            textColor="primary"
            {...a11yProps('overview')}
          />
          <Tab value="data_sources" label="Data Sources" {...a11yProps('data_sources')} />
          <Tab value="methodology" label="Methodology" {...a11yProps('methodology')} />
          <Tab value="faq" label="FAQ" {...a11yProps('faq')} />
          <Tab value="acknowledgments" label="Acknowledgements" {...a11yProps('acknowledgments')} />
        </Tabs>
        <div style={{verticalAlign: "top", display: "inline-block", width: "84.5%"}}>
          <TabPanel value={selectedTab} index="overview"/>
          <TabPanel value={selectedTab} index="data_sources"/>
          <TabPanel value={selectedTab} index="methodology"/>
          <TabPanel value={selectedTab} index="faq"/>
          <TabPanel value={selectedTab} index="acknowledgments"/>
        </div>
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
