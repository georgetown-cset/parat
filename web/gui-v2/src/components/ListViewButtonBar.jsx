import React, { useLayoutEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { CSVLink } from 'react-csv';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { Button } from '@mui/material';

import {
  HelpTooltip,
  classes,
} from '@eto/eto-ui-components';

import { useWindowSize } from '../util';

const styles = {
  standardText: css`
    font-family: GTZirkonLight;
    letter-spacing: 0.00938em;
    line-height: 1.5;
    text-transform: uppercase;
  `,
  buttonBar: css`
    background-color: var(--bright-blue-lighter);
    display: flex;
    flex-wrap: wrap;
    padding: 0.5rem;

    button {
      font-family: GTZirkonLight;

      svg {
        margin-right: 5px;
      }
    }
  `,
  buttonBarLeft: css`
    align-items: center;
    color: var(--dark-blue);
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin: 6px 8px;

    & > span {
      align-items: center;
    }
  `,
  activeFilterTooltip: css`
    .MuiTooltip-tooltip {
      max-width: 400px;

      li > span {
        font-family: GTZirkonLight;
      }
    }
  `,
  activeFiltersText: css`
    align-items: center;
    display: flex;

    svg {
      fill: var(--bright-blue);
      height: 16px;
    }
  `,
  buttonBarRight: css`
    display: flex;
    margin-left: auto;
  `,
  buttonBarButton: css`
    min-width: 40px;
  `,
  csvDownloadButton: css`
    height: 100%;
  `,
};

const BUTTONBAR_PADDING = 16;
const BUTTONBAR_LEFT_MARGIN = 16;
const BUTTON_WIDTH_RESET = 145;
const BUTTON_WIDTH_DOWNLOAD = 182;
const BUTTON_WIDTH_COLUMNS = 202;
const BUTTON_WIDTH_NO_LABEL = 45;
const BUTTONBAR_RIGHT_MIN_WIDTH = 3 * BUTTON_WIDTH_NO_LABEL;


const ButtonBar = ({
  activeFilters,
  activeFiltersTooltip,
  currentFilters,
  exportData,
  exportHeaders,
  numCompanies,
  resetFilters,
  setDialogOpen,
  totalRows,
}) => {
  const windowSize = useWindowSize();

  // Adjust the visibility of the buttonbar labels based on how much space we have
  // available based on the viewport width.
  // TODO: Refactor the buttonbar into a separate component.
  const buttonBarRef = useRef();
  const buttonBarLeftRef = useRef();
  const [buttonBarWidth, setButtonBarWidth] = useState(500);
  const [buttonBarLeftWidth, setButtonBarLeftWidth] = useState(200);
  const [showLabelReset, setShowLabelReset] = useState(false);
  const [showLabelDownload, setShowLabelDownload] = useState(false);
  const [showLabelColumns, setShowLabelColumns] = useState(false);

  useLayoutEffect(() => {
    const barBounds = buttonBarRef.current.getBoundingClientRect();
    setButtonBarWidth(barBounds.width - BUTTONBAR_PADDING);
    const leftBounds = buttonBarLeftRef.current.getBoundingClientRect();
    setButtonBarLeftWidth(leftBounds.width + BUTTONBAR_LEFT_MARGIN);
  }, [currentFilters, windowSize]);

  // The label for Download is hidden first, then Columns, and finally Reset is hidden last.
  useLayoutEffect(() => {
    let spaceForButtons = buttonBarWidth - buttonBarLeftWidth;
    // If we don't have enough space on the first row for the the buttons without *any* labels,
    // flexbox will wrap us onto the next line, so we have the full buttonbar width to use.
    if ( spaceForButtons < BUTTONBAR_RIGHT_MIN_WIDTH ) {
      spaceForButtons = buttonBarWidth;
    }

    if ( spaceForButtons >= BUTTON_WIDTH_RESET + BUTTON_WIDTH_COLUMNS + BUTTON_WIDTH_DOWNLOAD ) {
      setShowLabelReset(true);
      setShowLabelDownload(true);
      setShowLabelColumns(true);
    } else if ( spaceForButtons >= BUTTON_WIDTH_RESET + BUTTON_WIDTH_COLUMNS + BUTTON_WIDTH_NO_LABEL) {
      setShowLabelReset(true);
      setShowLabelDownload(false);
      setShowLabelColumns(true);
    } else if ( spaceForButtons >= BUTTON_WIDTH_RESET + 2*BUTTON_WIDTH_NO_LABEL ) {
      setShowLabelReset(true);
      setShowLabelDownload(false);
      setShowLabelColumns(false);
    } else {
      setShowLabelReset(false);
      setShowLabelDownload(false);
      setShowLabelColumns(false);
    }
  }, [buttonBarWidth, buttonBarLeftWidth]);


  return (
    <div css={styles.buttonBar} ref={buttonBarRef}>
      <div css={[styles.buttonBarLeft, styles.standardText]} ref={buttonBarLeftRef}>
        <span>Viewing {numCompanies !== totalRows ? `${numCompanies} of ${totalRows}` : totalRows} companies</span>
        {activeFilters.length > 0 &&
          <HelpTooltip css={styles.activeFilterTooltip} text={activeFiltersTooltip}>
            <span css={styles.activeFiltersText}>
              ({activeFilters.length} filters active)
              <HelpIcon />
            </span>
          </HelpTooltip>
        }
      </div>
      <div css={styles.buttonBarRight}>
        <HelpTooltip
          css={styles.activeFilterTooltip}
          text={activeFilters.length > 0 && activeFiltersTooltip}
        >
          <Button
            css={styles.buttonBarButton}
            disabled={activeFilters.length === 0}
            onClick={resetFilters}
          >
            <CloseIcon />
            <span className={classes([!showLabelReset && "sr-only"])}>
              Reset filters
            </span>
          </Button>
        </HelpTooltip>
        <CSVLink data={exportData} filename="eto-parat-export.csv" headers={exportHeaders}>
          <Button
            css={[styles.buttonBarButton, styles.csvDownloadButton]}
            title="Download the results as a comma-separated value (CSV) file.  Existing sorts will be retained."
          >
            <DownloadIcon />
            <span className={classes([!showLabelDownload && "sr-only"])}>
              Download results
            </span>
          </Button>
        </CSVLink>
        <Button css={styles.buttonBarButton} onClick={() => setDialogOpen(true)}>
          <AddCircleOutlineIcon />
          <span className={classes([!showLabelColumns && "sr-only"])}>
            Add/remove columns
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ButtonBar;
