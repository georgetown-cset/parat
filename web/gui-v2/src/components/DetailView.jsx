import React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { css } from '@emotion/react';
import {
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import {
  Breadcrumbs,
  Typography,
} from '@mui/material';

import {
  InfoCard,
  TableOfContents,
  breakpoints,
  breakpointStops,
} from '@eto/eto-ui-components';

import DetailViewIntro from './DetailViewIntro';
import DetailViewPublications from './DetailViewPublications';
import DetailViewPatents from './DetailViewPatents';
import DetailViewWorkforce from './DetailViewWorkforce';
import tableOfContentsData from '../static_data/detail-toc.json';
import { useWindowSize } from '../util';


const styles = {
  breadcrumbs: css`
    margin: 1rem 15px 0;

    ${breakpoints.tablet_regular} {
      margin: 1rem 65px 0;
    }

    .MuiTypography-root {
      font-family: GTZirkonRegular;
    }
  `,
  error: css`
    background-color: pink;
    color: darkred;
    padding: 1rem;
  `,
  infocard: css`
    margin-top: 1rem;

    ${breakpoints.tablet_regular} {
      margin-top: 1rem;
    }

    .description {
      padding-right: 20px; /* TODO: CHECK FOR RESPONSIVENESS */
      width: 100%;

      * + .metadata-table {
        margin-top: 0;
      }
    }

    small.stock-ticker {
      font-size: 60%;
    }
  `,
  contentsWrapper: css`
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;

    ${breakpoints.medium} {
      grid-template-columns: 200px 1fr;
    }
  `,
  toc: css`
    /* grid-area: toc; */
  `,
  contentsArea: css`
    /* grid-area: contents; */
  `,
};

const DetailView = ({
  companyData,
  companyId,
}) => {
  const windowSize = useWindowSize();

  if ( companyId === undefined ) {
    return <div css={styles.error}>ERROR: No company ID found: "{companyId}"</div>
  }

  if ( companyData ) {
    const breadcrumbs = [
      <GatsbyLink href="/">
        ETO PARAT
      </GatsbyLink>,
      <Typography>
        {companyData.name}
      </Typography>
    ];

    return (
      <>
        <Breadcrumbs css={styles.breadcrumbs} separator={<NavigateNextIcon fontSize="small" />}>
          {breadcrumbs}
        </Breadcrumbs>
        <InfoCard
          css={styles.infocard}
          description={
            <DetailViewIntro
              companyId={companyId}
              data={companyData}
            />
          }
          headingComponent="h1"
          title={
            <>
              {companyData.name}
              {companyData.market_list &&
                <> <small className="stock-ticker">({companyData.market_list})</small></>
              }
            </>
          }
        >
          <div css={styles.contentsWrapper}>
            {windowSize >= breakpointStops.medium &&
              <TableOfContents css={styles.toc} toc={tableOfContentsData} />
            }
            <div css={styles.contentsArea}>
              <DetailViewPublications data={companyData} />
              <DetailViewPatents data={companyData} />
              <DetailViewWorkforce data={companyData} />
            </div>
          </div>
        </InfoCard>
      </>
    );
  } else {
    return (
      <div css={styles.error}>
        Unable to find company for <tt>CSET_id={companyId}</tt>
      </div>
    );
  }
};

export default DetailView;
