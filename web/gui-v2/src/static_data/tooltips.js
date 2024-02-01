import React from 'react';

import { ExternalLink } from '@eto/eto-ui-components';

const tooltips = {
  columnHeaders: {
    name: "",
    country: "",
    continent: "",
    stage: "",
    sector: "",

    all_pubs: "",
    all_pubs_5yr: "",
    citations: "",
    ai_pubs: "",
    ai_pubs_growth: "Average yearly growth over the past 3 years",
    ai_pubs_percent: "",
    ai_pubs_top_conf: "",
    ai_pubs_last_full_year: "",
    cv_pubs: "",
    nlp_pubs: "",
    ro_pubs: "",

    all_patents: "",
    all_patents_5yr: "",
    ai_patents: "",
    ai_patents_growth: "Average yearly growth over the past 3 years",
    ai_patents_percent: "",
    ai_patents_grants: "",
    agri_patents: "",
    algorithms: "",
    finance_patents: "",
    business_patents: "",
    comp_vision: "",
    comp_in_gov_patents: "",
    control: "",
    distributed_ai: "",
    doc_mgt_patents: "",
    edu_patents: "",
    entertain_patents: "",
    industry_patents: "",
    knowledge_rep: "",
    lang_process: "",
    life_patents: "",
    measure_test: "",
    mil_patents: "",
    nano_patents: "",
    network_patents: "",
    personal_comp_patents: "",
    phys_sci_patents: "",
    plan_sched: "",
    robotics: "",
    security_patents: "",
    semiconductor_patents: "",
    speech: "",
    telecom_patents: "",
    transport_patents: "",

    ai_jobs: "",
    tt1_jobs: "",
  },
  groupExplanations: {
    sp500: (
      <>
        PARAT may not list exactly 500 companies for this group:
        <ul>
          <li>
            S&P 500 membership changes over time, and so PARAT includes all companies
            that were present on the list at <em>some</em> point in 2020.  This can
            increase the number of listed companies.
          </li>
          <li>
            Companies that were acquired during the data period will be listed under
            the acquiring company, even if that company is not itself on the S&P 500.
            This can reduce the number of listed companies.
          </li>
        </ul>
        For more information, review <ExternalLink href="https://eto.tech/tool-docs/parat#SOME_METHODOLOGY_SECTION">our documentation</ExternalLink>.
      </>
    ),
  },
};

export { tooltips };
