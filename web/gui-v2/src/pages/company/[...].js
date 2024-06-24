import React, { useEffect } from 'react';
import { Link, navigate } from 'gatsby';
import { css } from '@emotion/react';
import { Router } from '@gatsbyjs/reach-router';
import { Warning as WarningIcon } from '@mui/icons-material';

import { AppWrapper } from '@eto/eto-ui-components';

import { company_data as allCompanies } from '../../static_data/data';
import { slugifyCompanyName } from '../../util';

const styles = {
  notice: css`
    align-items: center;
    display: flex;
    flex-direction: column;
    font-size: 1.4rem;
    justify-content: center;
    padding: 60px 0;

    & > * {
      margin: 0;
    }

    & > * + * {
      margin-top: 1.5rem;
    }
  `,
  error: css`
    background-color: var(--orange-lightest);

    a {
      font-family: GTZirkonRegular;
    }
  `,
  message: css`
    align-items: center;
    display: flex;

    svg {
      color: var(--orange);
    }

    & > * + * {
      margin-left: 0.5rem;
    }
  `,
};

const NoCompany = ({ error }) => {
  return (
    <AppWrapper>
      <div css={[styles.notice, styles.error]}>
        <p css={styles.message}>
          <WarningIcon />
          <span>{error}</span>
          <WarningIcon />
        </p>
        <Link to="/">Try selecting a company from the PARAT homepage</Link>
      </div>
    </AppWrapper>
  );
};

const GenericPage = (props) => {
  let companyData = null;
  let companyId = null;
  const idMatch = props.slug.match(/^(\d+)/);

  if ( !idMatch ) {
    return <NoCompany error={`We don't have data for a company with the ID '${props.slug}'`} />;
  } else {
    companyId = parseInt(idMatch[1]);
    companyData = allCompanies.find(e => e.cset_id === companyId);

    if ( !companyData ) {
      return <NoCompany error="We didn't find data for this company" />;
    }
  }

  useEffect(() => {
    if ( companyData?.name ) {
      const slugifiedName = slugifyCompanyName(companyData.name);
      setTimeout(() => {
        navigate(`/company/${companyId}-${slugifiedName}/`);
      }, 10);
    }
  }, []);

  return (
    <div css={styles.notice}>
      Redirecting to {companyData.name}...
    </div>
  );
}

const FallbackPage = () => {
  // Route URLs both with and without the `/index.html` on the end to the same
  // components.  The `/123-FOO/index.html` pages will redirect to `/123-FOO/`.
  return (
    <Router basepath="/">
      <GenericPage path="/company/:slug" />
      <GenericPage path="/company/:slug/index.html" />
    </Router>
  )
};

export default FallbackPage;

export const Head = () => {
  return (
    <>
      <html lang="en" />
      <title>Error &ndash; Emerging Technology Observatory</title>
    </>
  );
};
