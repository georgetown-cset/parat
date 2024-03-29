import React, { useEffect } from "react";
import {graphql} from "gatsby";
import Button from "@material-ui/core/Button";
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from "@material-ui/core/Link";
import PropTypes from "prop-types";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from '@material-ui/core/Typography';

import cset_logo from "../images/cset_logo.svg";
import "../styles/styles.css";
import {tab_text} from "../static_data/text";

const CollapsibleTable = React.lazy(() => import("../components/table"));

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

const IndexPage = ({data}) => {

  useEffect(() => {
    document.title = "CSET PARAT";
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
                target="_blank"
                rel="noreferrer">
          Questions and Submissions
        </Button>
      </div>
      <div>
        <div style={{margin: "20px 20px 30px 20px"}}>
          <div style={{margin: "0 6%", display: "inline-block"}}>
            <h2><span role={"img"} aria-label={"parat logo"}>🦜</span> Welcome to PARAT, CSET's Private-sector AI-Related Activity Tracker.</h2>
            <Typography variant={"body1"} style={{fontSize: "110%", marginBottom: "10px"}}>
              PARAT collects data related to companies' artificial intelligence research and development in order to inform analyses of the
              global AI sector. This tracker includes companies with various degrees of AI activity that CSET has
              considered relevant to research at the intersection of AI and national security. <Link onClick={toggleDesc} style={{cursor: "pointer", fontWeight: "bold"}}>{showDesc ? "Hide details..." : "Dig deeper..."}</Link>
            </Typography>
            <Typography variant={"body1"} style={{fontSize: "110%"}}>
              We <Link href={"https://docs.google.com/forms/d/e/1FAIpQLSdMNP7fg3_HkIdKh_IZBksm6vZCbzb1cRZS-sdeLL5i3yxi_g/viewform"} target="_blank" rel="noreferrer">welcome</Link> your feedback, corrections, and additions.
            </Typography>
          </div>
        </div>
        <div style={{"display": showDesc ? "block" : "none", paddingBottom: "50px"}}>
          <Tabs value={selectedTab} onChange={handleTabChange} orientation={simplify ? "horizontal" : "vertical"}
                style={{borderRight: "1px solid grey",
                  width: (simplify ? "100%" : "15%"),
                  display: (simplify ? "block" : "inline-block"),
                  marginBottom: (simplify ? "20px" : "0px"),
                  textAlign: "center",
                  overflow: "auto"}}
                variant={simplify ? "scrollable" : "standard"} scrollButtons={"off"}>
            <Tab value="overview" label="Overview" textColor="primary" {...a11yProps('overview')} />
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
          Powered by <Link href={"https://www.crunchbase.com/"} target="_blank" rel="noreferrer">Crunchbase</Link>, <Link href={"https://material-ui.com/"} target="_blank" rel="noreferrer">Material-UI</Link>, <Link href={"https://www.gatsbyjs.com/"} target="_blank" rel="noreferrer">GatsbyJS</Link>, and <Link href={"https://www.chartjs.org/"} target="_blank" rel="noreferrer">Chart.js</Link>. Last updated on {data.site.buildTime}.
        </div>
      </div>
    </main>
  )
};


export default IndexPage;

export const query = graphql`
  query {
    site {
      buildTime(formatString: "MMMM DD, YYYY")
    }
  }
`;
