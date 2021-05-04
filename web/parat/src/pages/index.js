import React, { useEffect } from "react";
import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from "@material-ui/core/Link";
import PropTypes from "prop-types";
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
        tab_text[index].map((para, idx) =>
          <div style={{paddingBottom: "10px"}} dangerouslySetInnerHTML={para} className={"MuiTypography-body1"} key={idx}></div>
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
    window.addEventListener("resize", handleWindowResize);
    handleWindowResize();
  }, []);

  // thank you https://stackoverflow.com/a/63066975
  const isSSR = typeof window === "undefined";

  const [showDesc, setShowDesc] = React.useState(false);
  const toggleDesc = () => {
    setShowDesc(!showDesc);
  };

  const [selectedTab, setSelectedTab] = React.useState("overview");
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const [simplify, setSimplify] = React.useState(true);
  const handleWindowResize = () => {
    setSimplify(window.innerWidth < 1220)
  };

  return (
    <main style={{backgroundColor: "#F9F9F9"}}>
      <div id="toolbar" style={{"padding": "20px"}}>
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
      <div>
        <div style={{margin: "20px 20px 30px 20px"}}>
          <div style={{margin: "0 6%", display: "inline-block"}}>
            <h2><span role={"img"} aria-label={"parat logo"}>🦜</span> Welcome to PARAT, CSET's Private-sector AI-Related Activity Tracker.</h2>
            <h3 style={{fontWeight: "normal"}}>
              PARAT collects data related to companies' AI research and development in order to inform analysis of the
              global AI sector. This tracker includes companies with various degrees of AI activity that CSET has
              considered relevant to research at the intersection of AI and national security. <Link onClick={toggleDesc} style={{cursor: "pointer"}}>{showDesc ? "Hide details..." : "Show details..."}</Link>
            </h3>
          </div>
        </div>
        <div style={{"display": showDesc ? "block" : "none", paddingBottom: "50px"}}>
          <Tabs value={selectedTab} onChange={handleTabChange} orientation={simplify ? "horizontal" : "vertical"}
                style={{borderRight: "1px solid grey",
                  width: (simplify ? "100%" : "15%"),
                  display: (simplify ? "block" : "inline-block"),
                  marginBottom: (simplify ? "20px" : "0px"),
                  textAlign: "center",
                  overflow: "scroll"}}
                variant={simplify ? "scrollable" : "standard"} scrollButtons={"off"}>
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
          <div style={{verticalAlign: "top", display: "inline-block", width: (simplify ? "100%" : "84.5%")}}>
            <TabPanel value={selectedTab} index="overview" key={"overview"}/>
            <TabPanel value={selectedTab} index="data_sources" key={"data_sources"}/>
            <TabPanel value={selectedTab} index="methodology" key={"methodology"}/>
            <TabPanel value={selectedTab} index="faq" key={"faq"}/>
            <TabPanel value={selectedTab} index="acknowledgments" key={"acknowledgments"}/>
          </div>
        </div>
      </div>
      <div style={{padding: "10px 40px", backgroundColor: "#FFFFFF"}} id="table-container">
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
