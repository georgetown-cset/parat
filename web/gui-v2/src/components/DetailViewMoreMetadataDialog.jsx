import React from 'react';
import { css } from '@emotion/react';
import { Dialog, DialogTitle } from '@mui/material';

import { ButtonStyled, ExternalLink } from '@eto/eto-ui-components';

import TwoColumnTable from './TwoColumnTable';

const styles = {
  dialog: css`
    .MuiPaper-root {
      background-color: var(--bright-blue-light);
    }
  `,
  dialogTitle: css`
    font-family: GTZirkonRegular;
    text-align: center;
  `,
  dialogInnerWrapper: css`
    font-family: GTZirkonLight;
    padding: 0 0.5rem 0.5rem;
  `,
  dialogContents: css`
    background-color: var(--bright-blue-lightest);
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    padding: 0.5rem;
  `,
  table: css`
    th,
    td {
      background-color: var(--bright-blue-lightest);
    }
  `,
  linkWrapper: css`
    display: flex;
    flex-direction: column;
  `,
  stockList: css`
    list-style: none;
    margin: 0;
  `,
  dialogBottom: css`
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  `,
};

/**
 * A dialog for displaying more metadata about a particular company.
 *
 * @param {object} props
 * @param {object} props.data
 * @param {boolean} props.isOpen
 * @param {(newState: boolean) => void} props.updateIsOpen
 * @returns {JSX.Element}
 */
const MoreMetadataDialog = ({
  data,
  isOpen,
  updateIsOpen,
}) => {
  const metadata = [
    { title: 'Name', value: data.name },
    { title: 'Aliases', value: data.aliases },
    { title: 'Country', value: data.country },
    { title: 'Continent', value: data.continent },
    { title: 'Website', value: data.website ? <ExternalLink href={data.website}>{data.website}</ExternalLink> : undefined },
    {
      title: 'Crunchbase',
      value: <div css={styles.linkWrapper}>
        <ExternalLink href={data.crunchbase.url}>{data.crunchbase.url}</ExternalLink>
        {data.child_crunchbase.map(e => <ExternalLink href={e.url} key={e.url}>{e.url}</ExternalLink>)}
      </div>
    },
    {
      title: 'LinkedIn',
      value: <div css={styles.linkWrapper}>
        {data.linkedin.map(e => <ExternalLink href={e} key={e}>{e}</ExternalLink>)}
      </div>
    },
    { title: 'Stage', value: data.stage },
  ];

  if ( data.market && data.market.length > 0 ) {
    metadata.push({
      title: "Stock tickers",
      value: (
        <ul css={styles.stockList}>
          {data.market.map((e) => <li key={e.text}><ExternalLink href={e.url}>{e.text}</ExternalLink></li>)}
        </ul>
      ),
    });
  }

  const handleClose = () => {
    updateIsOpen(false);
  };

  return (
    <Dialog
      css={styles.dialog}
      open={isOpen}
      onClose={() => updateIsOpen(false)}
    >
      <DialogTitle css={styles.dialogTitle}>
        { data.name } details
      </DialogTitle>
      <div css={styles.dialogInnerWrapper}>
        <div css={styles.dialogContents}>
          <TwoColumnTable
            css={styles.table}
            data={metadata}
          />
        </div>
        <div css={styles.dialogBottom}>
          <ButtonStyled onClick={handleClose} variant="contained">
            Close
          </ButtonStyled>
        </div>
      </div>
    </Dialog>
  );
};

export default MoreMetadataDialog;
