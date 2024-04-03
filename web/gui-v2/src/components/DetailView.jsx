import React, { useEffect } from 'react';
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
import overallData from '../static_data/overall_data.json';
import { useWindowSize } from '../util';
import { plausibleEvent } from '../util/analytics';


const styles = {
  breadcrumbs: css`
    margin: 1rem 15px 0;

    ${breakpoints.tablet_regular} {
      margin: 1rem 65px 0;
    }

    .MuiBreadcrumbs-li,
    .MuiTypography-root {
      font-family: GTZirkonLight;
    }
  `,
  error: css`
    background-color: pink;
    color: darkred;
    padding: 1rem;
  `,
  infocard: css`
    margin-bottom: 0;
    margin-top: 1rem;

    ${breakpoints.tablet_regular} {
      margin-bottom: 0;
      margin-top: 1rem;
    }

    .description {
      padding-right: 0;
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
  tocWrapper: css`
    max-height: 250px;
    position: sticky;
    top: 0px;
  `,
  contentsArea: css`
    max-width: calc(100vw - 51px);
  `,
};

const DetailView = ({
  companyData,
  companyId,
}) => {
  const windowSize = useWindowSize();

  useEffect(() => {
    plausibleEvent('Load detail page', { companyId, companyName: companyData?.name });
  }, []);

  if ( companyId === undefined ) {
    return <div css={styles.error}>ERROR: No company ID found: "{companyId}"</div>
  } else if ( companyData === undefined ) {
    return <div css={styles.error}>ERROR: No data for company "{companyId}"</div>
  }

  if ( companyData ) {
    const breadcrumbs = [
      <GatsbyLink to="/#table" key="root">
        ETO PARAT
      </GatsbyLink>,
      <Typography key={companyId}>
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
          title={companyData.name}
        >
          <div css={styles.contentsWrapper}>
            {windowSize >= breakpointStops.medium &&
              <div css={styles.tocWrapper}>
                <TableOfContents toc={tableOfContentsData} />
              </div>
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
