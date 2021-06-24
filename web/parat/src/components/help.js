import React from "react";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

const HelpModal = (props) => {
  const {open, onClose} = props;
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby={"Help"} aria-describedby={"Information about how to interpret PARAT columns"}>
      <DialogTitle>
        How to use PARAT
      </DialogTitle>
      <DialogContent style={{paddingBottom: "20px"}}>
        <Typography component={"body2"}>The data in PARAT can be filtered using the following columns:</Typography>
        <Typography component={"body2"}>
        <ul>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>Company Name</span>: Filters results to only the selected company names. This can be used to select a few interesting companies for export.
          </li>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>Country</span>: Filters results to companies headquartered in the selected countries.
          </li>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>Region</span>: Filters results to companies headquartered in the selected regions.
          </li>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>Stage</span>: Filters results to companies at a certain stage of growth.
          </li>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>AI Publications</span>: Filters to companies with a number of publications since 2010 that fall in a certain range.
          </li>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>Top AI Conf Pubs</span>: Filters to companies with a number of publications in top AI conferences since 2010 that fall in a certain range.
          </li>
          <li style={{margin: "5px 0px"}}>
            <span style={{fontWeight:"bold"}}>AI Patents</span>: Filters to companies with a number of patents since 2010 that fall in a certain range.
          </li>
        </ul>
        </Typography>
        <Typography component={"body2"}>
        For more details on how these values are assigned, click on "Dig deeper" in the header and take a look at the Methodology section. We welcome your
        feedback and suggestions.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;