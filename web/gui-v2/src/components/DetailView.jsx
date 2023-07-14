import React from 'react';
import { css } from '@emotion/react';
import {
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import {
  Breadcrumbs,
  Link,
  Typography,
} from '@mui/material';

import { InfoCard, breakpoints } from '@eto/eto-ui-components';

import DetailViewIntro from './DetailViewIntro';
import { company_data } from '../static_data/data';

console.info("company_data:", company_data); // DEBUG

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
  `,
};

const DetailView = ({}) => {
  const match = window.location.pathname.match(/company\/([^\/]*)/);
  console.info("match:", match); // DEBUG
  if ( ! match || match.len < 2 || match[1] === "" ) {
    // TODO: what behavior do we want if no or an invalid slug is provided?
    // alert("No company detected - future: Redirect?"); // TEMP
    return <div css={styles.error}>ERROR: no URL slug match</div>;
  }
  const companySlug = match[1];
  console.info("slug:", companySlug); // DEBUG

  const idMatch = match[1].match(/(\d+)/);
  if ( ! idMatch || idMatch.len < 2 ) {
    return <div css={styles.error}>ERROR: No company ID found: "{match[1]}"</div>
  }
  const companyId = parseInt(idMatch[1]);
  console.info("companyId:", companyId); // DEBUG

  const companyData = company_data.find(e => e.CSET_id === companyId);

  const breadcrumbs = [
    <Link href="/">
      ETO PARAT
    </Link>,
    <Typography>
      {companyData.name}
    </Typography>
  ];


  if ( companyData ) {
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
          // sidebarContent="SIDEBAR CONTENT?"
          title={companyData.name}
        >
          Main contents goes here.....
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
