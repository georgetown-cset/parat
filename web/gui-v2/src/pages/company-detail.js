import React from 'react';
import { css } from '@emotion/react';

import { AppWrapper } from '@eto/eto-ui-components';

import DetailView from '../components/DetailView';
import { company_data } from '../static_data/data';

console.info("company_data:", company_data); // DEBUG

const styles = {};


// Identify the company that we are working with
// TODO: Refactor this so that it runs when the page loads, not just on the
//       initial load (currently the data won't update when the page switches
//       via Gatsby's `Link` component).
const slugMatch = window.location.pathname.match(/company\/([^\/]*)/);
const slug = slugMatch?.[1];
const idMatch = slug?.match?.(/(\d+)/);
const companyId = idMatch?.[1] ? parseInt(idMatch[1]) : undefined;
console.info("companyId:", slug, "-->", companyId); // DEBUG

const companyData = company_data.find(e => e.CSET_id === companyId);


const CompanyDetailPage = () => {

  return (
    <AppWrapper>
      <DetailView
        companyData={companyData}
        companyId={companyId}
      />
    </AppWrapper>
  );
};

export default CompanyDetailPage;

export const Head = (headProps) => {
  console.info("company headProps:", headProps); // DEBUG
  return (
    <title>{companyData?.name} &ndash; PARAT &ndash; Emerging Technology Observatory</title>
  );
};
