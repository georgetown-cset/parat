import React from 'react';
import { graphql } from 'gatsby';

import { AppWrapper } from '@eto/eto-ui-components';

import DetailView from '../../components/DetailView';
import { company_data as allCompanies } from '../../static_data/data';
import { slugifyCompanyName } from '../../util';

const CompanyPage = ({ data }) => {
  console.info("data>", data); // DEBUG
  const { cset_id: companyId, name: companyName } = data.companiesJson;
  console.info(companyId, companyName); // DEBUG

  const companyData = allCompanies.find(e => e.cset_id === companyId);
  console.info("company>", companyData); // DEBUG

  return (
    <AppWrapper>
      <title>{companyName} &ndash; PARAT &ndash; Emerging Technology Observatory</title>
      <DetailView
        companyData={companyData}
        companyId={companyId}
      />
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
