import React from 'react';
import { Link } from 'gatsby';
import { css } from '@emotion/react';
import { Router, navigate } from '@reach/router';

import { company_data as allCompanies } from '../../static_data/data';
import { slugifyCompanyName } from '../../util';


const styles = {
  error: css`
    background-color: pink;
  `,
  notice: css`
    align-items: center;
    display: flex;
    flex-direction: column;
    font-size: 1.4rem;
    justify-content: center;
    padding: 60px 0;
  `,
};

const NoCompany = ({ error }) => {
  return (
    <div css={[styles.notice, styles.error]}>
      Error: {error}
      <Link to="/">Try selecting a company from the PARAT homepage</Link>
    </div>
  );
};

const GenericPage = (props) => {
  console.info("generic page...", props); // DEBUG

  let companyData = null;
  let companyId = null;
  const idMatch = props.slug.match(/^(\d+)/);
  console.info("idMatch:", idMatch); // DEBUG

  if ( !idMatch ) {
    return <NoCompany error="No company ID specified" />;
  } else {
    companyId = parseInt(idMatch[1]);
    companyData = allCompanies.find(e => e.cset_id === companyId);

    if ( !companyData ) {
      return <NoCompany error="No matching company found" />;
    }

    const slugifiedName = slugifyCompanyName(companyData.name);
    setTimeout(() => {
      navigate(`/company/${companyId}-${slugifiedName}`);
    }, 20);

    return (
      <div css={styles.notice}>
        Redirecting to {companyData.name}...
      </div>
    );
  }


  // if ( idMatch ) {
  //   console.info("match:", idMatch); // DEBUG
  //   companyId = parseInt(idMatch[1]);

  //   companyData = allCompanies.find(e => e.cset_id === companyId);
  //   console.info("company>", companyId, companyData); // DEBUG

  //   const slugifiedName = slugifyCompanyName(companyData.name);
  //   console.info("  - slug:", slugifiedName); // DEBUG

  //   // navigate(`/company/${companyId}-${slugifiedName}`);

  //   setTimeout(() => {
  //     navigate(`/company/${companyId}-${slugifiedName}`);
  //   }, 20);

  //   // return (
  //   //   <div css={styles.redirecting}>
  //   //     Redirecting to {companyData.name}...
  //   //   </div>
  //   // )
  // } else {
  //   console.info("no match"); // DEBUG

  //   // return (
  //   //   <div>
  //   //     ERROR - no company
  //   //   </div>
  //   // )
  // }


}


const FallbackPage = () => {
  console.info("fallback page..."); // DEBUG

  return (
    <Router basepath="/">
      <GenericPage path="/company/:slug" />
    </Router>
  )
};

export default FallbackPage;
