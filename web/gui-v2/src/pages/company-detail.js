import React from 'react';

import { AppWrapper } from '@eto/eto-ui-components';

import DetailView from '../components/DetailView';
import { company_data } from '../static_data/data';
import { slugifyCompanyName } from '../util';

// console.info("company_data:", company_data); // DEBUG


const CompanyDetailPage = () => {
  // Identify the company that we are working with
  const slugMatch = typeof window !== "undefined" ? window.location.pathname.match(/company\/([^/]*)/) : "";
  const slug = slugMatch?.[1];
  const idMatch = slug?.match?.(/(\d+)/);
  const companyId = idMatch?.[1] ? parseInt(idMatch[1]) : undefined;

  const companyData = company_data.find(e => e.cset_id === companyId);

  // If the `pathname` of the page doesn't match the authoritative pathname for
  // the identified company (i.e. of the form `/company/ID-SLUGIFIED_NAME`),
  // redirect to the correct form.  This ensures that the visible URL will always
  // include a human-readable form of the company, while internally the site
  // only has to deal with the ID number (the internal `cset_id` field).
  const slugifiedName = slugifyCompanyName(companyData?.name);
  const realSlug = `${companyId}-${slugifiedName}`;
  if ( slug !== realSlug ) {
    console.info("** The full slug for this company isn't present - we should redirect"); // DEBUG
    if ( typeof window !== "undefined" ) {
      window?.history.replaceState({}, '', `/company/${realSlug}/${window.location.search}`);
    }
  } else {
    console.info(`-- we are on the authoritative page for company ${companyId}`) // DEBUG
  }

  return (
    <AppWrapper>
      <title>{companyData?.name} &ndash; PARAT &ndash; Emerging Technology Observatory</title>
      <DetailView
        companyData={companyData}
        companyId={companyId}
      />
    </AppWrapper>
  );
};

export default CompanyDetailPage;
