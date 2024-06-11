import React, { useState } from 'react';
import { css } from '@emotion/react';

import {
  ButtonStyled,
  ExternalLink,
  breakpoints,
} from '@eto/eto-ui-components';

import MoreMetadataDialog from './DetailViewMoreMetadataDialog';
import TwoColumnTable from './TwoColumnTable';

const styles = {
  detailIntroWrapper: css`
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    width: 100%;

    ${breakpoints.tablet_small} {
      grid-template-columns: 1fr 300px;
    }
  `,
  descriptionBlurbs: css`
    small {
      color: var(--grey);
      font-size: 75%;

      a {
        color: var(--bright-blue);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `,
  metadataTable: css`
    margin: 0 auto;
    width: 300px;

    td {
      padding: 0.5rem;
    }
  `,
  buttonWrapper: css`
    display: flex;
    margin-top: 1rem !important;

    button {
      margin-left: auto;
    }
  `,
};

const DetailViewIntro = ({
  companyId,
  data,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const metadata = [
    { title: "Country", value: data.country },
    { title: "Sector", value: data.sector },
    { title: "Website", value: data.website ? <ExternalLink href={data.website}>{data.website}</ExternalLink> : undefined },
  ];

  const titleCaseSource = (source) => {
    return source.charAt(0).toUpperCase()+source.substr(1);
  }

  return (
    <div css={styles.detailIntroWrapper}>
      <div css={styles.descriptionBlurbs}>
        {data?.description ?
          <>
            <div>{data.description}</div>
            <small>
              <ExternalLink href={data.description_link}>{titleCaseSource(data.description_source)}</ExternalLink>, retrieved {data.description_retrieval_date}
            </small>
          </>
        :
          <div>No description available</div>
        }
      </div>
      <div>
        <TwoColumnTable data={metadata} />

        <div css={styles.buttonWrapper}>
          <ButtonStyled onClick={() => setDialogOpen(true)}>
            View more metadata
          </ButtonStyled>
        </div>
      </div>
      <MoreMetadataDialog
        data={data}
        isOpen={dialogOpen}
        updateIsOpen={setDialogOpen}
      />
    </div>
  );
};

export default DetailViewIntro;
