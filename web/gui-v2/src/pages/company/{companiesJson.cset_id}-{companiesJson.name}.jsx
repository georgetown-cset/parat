import React from 'react';
import { graphql } from 'gatsby';

import { AppWrapper } from '@eto/eto-ui-components';

import DetailView from '../../components/DetailView';
import ParatUsageDisclaimer from '../../components/ParatUsageDisclaimer';
import { company_data as allCompanies } from '../../static_data/data';

const CompanyPage = ({ data }) => {
  const { cset_id: companyId, name: companyName } = data.companiesJson;

  const companyData = allCompanies.find(e => e.cset_id === companyId);

  return (
    <AppWrapper>
      <DetailView
        companyData={companyData}
        companyId={companyId}
      />
      <ParatUsageDisclaimer/>
    </AppWrapper>
  );
};

export default CompanyPage;

export const query = graphql`
  query ($id: String) {
    companiesJson(id: {eq: $id}) {
      cset_id
      name
    }
  }
`;

export const Head = ({ pageContext }) => {
  return (
    <>
      <html lang="en" />
      <title>{pageContext.name} &ndash; PARAT &ndash; Emerging Technology Observatory</title>
    </>
  );
};
