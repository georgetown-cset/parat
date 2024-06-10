import React from 'react';

import { ExternalLink } from '@eto/eto-ui-components';

const tooltips = {
  columnHeaders: {
    name: "",
    country: "The country where the company's headquarters is located.",
    continent: "",
    stage: <>The company's stage of development. <a href="zach_tktk" target="_blank" rel="noopener">Read more &gt;&gt;</a></>,
    sector: <>The company's "Primary Business Sector" (corresponding to "Business Sector" in the <ExternalLink href="https://www.lseg.com/en/data-analytics/financial-data/indices/trbc-business-classification">Thomson Reuters Business Classification</ExternalLink>) according to <ExternalLink href="">permid.org</ExternalLink>.</>,

    all_pubs: <>The total number of research publications (on any subject) the company released publicly over the prior 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    all_pubs_5yr: <>The total number of research publications (on any subject) the company released publicly over the prior 5 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_pubs: <>The total number of AI research publications that the company released publicly over the prior 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_pubs_growth: <>Recent growth in the company's AI research publications, defined as the average percentage increase per year over the past three years of complete data. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_pubs_percent: <>The percentage of the company's total research publications over the past ten years that were AI publications. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_pubs_top_conf: <>The number of research publications by authors from the company that were accepted to top AI conferences over the past ten years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_pubs_last_full_year: <>The total number of AI research publications that the company released in the last year for which complete data is available (currently 2022). <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    citations: <>The number of citations to AI research publications released by the company over the prior 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    cv_pubs: <>The total number of computer vision research publications that the company released publicly over the prior 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    nlp_pubs: <>The total number of natural language processing research publications that the company released publicly over the prior 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ro_pubs: <>The total number of robotics research publications that the company released publicly over the prior 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,

    all_patents: <>The number of patents (on any topic) the company filed over the past 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    all_patents_5yr: <>The number of patents (on any topic) the company filed over the past 5 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_patents: <>The number of AI-related patents the company filed over the past 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_patents_growth: <>Recent growth in the company's AI patent filings, defined as the average percentage increase per year over the past three years of complete data. (Patent data has a significant lag; the past three years of complete patent data typically equates to between three and six years behind the present.) <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_patents_percent: <>The percentage of the company's total filed patents over the past ten years that were AI-related. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    ai_patents_grants: <>The number of AI-related patents granted to the company over the past 10 years. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    agri_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    algorithms: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    finance_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    business_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    comp_vision: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    comp_in_gov_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    control: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    distributed_ai: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    doc_mgt_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    edu_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    entertain_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    industry_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    knowledge_rep: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    lang_process: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    life_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    measure_test: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    mil_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    nano_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    network_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    personal_comp_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    phys_sci_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    plan_sched: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    robotics: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed application. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    security_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    semiconductor_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    speech: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    telecom_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    transport_patents: <>The number of AI-related patents the company filed over the past 10 years that were relevant to the listed use case. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,

    ai_jobs: <>The number of known AI workers employed by the company as of the most recent data update. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
    tt1_jobs: <>The number of known Tech Tier 1 workers employed by the company as of the most recent data update. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
  },
  groupExplanations: {
    sp500: (
      <>
       S&P 500 companies as of May 2024.
      </>
    ),
    global500: (
      <>
        tooltip_tktktk
      </>
    ),
      globalBigTech: (
      <>
       Major multinational technology companies selected by ETO analysts.
      </>
    ),
      genAI: (
      <>
       Companies especially active in generative AI and large language model technologies, as identified by ETO analysts.
      </>
    ),
  },
  jobsExplanations: {
    chinaJobs: <>PARAT workforce data for this Chinese company are unreliable. Use with extreme caution. <a href="zach_tktk" target="_blank" rel="noopener">Read more &gt;&gt;</a></>,
    otherJobs: <>PARAT workforce data for this non-U.S. company may be unreliable. Use with extreme caution. <a href="zach_tktk" target="_blank" rel="noopener">Read more &gt;&gt;</a></>,
    noData: "This company is not included in PARAT's workforce data sources.",
  },
  detailView: {
    publications: {
      aiResearchArticles: <>For details on how we identify and count AI research articles, <ExternalLink href="tktk">read the PARAT documentation</ExternalLink></>.
      highlyCitedArticles: <>Highly cited articles are defined as the tktk% of articles in each publication year with the most citations.</>",
      topResearchTopicsTable: <>Articles are assigned to AI subtopics using ETO classifiers. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></>,
      topConferencePubsChart: <>Includes publications accepted at selected prominent AI research conferences around the world. <ExternalLink href="tktk">Read more &gt;&gt;</ExternalLink></></>,
    },
    patents: {
      aiRelatedPatents: <>For details on how we identify and count AI patent filings, <ExternalLink href="tktk">read the PARAT documentation</ExternalLink></>,
      topApplicationAreasTable: <>For details on how we identify application areas in AI patents, <ExternalLink href="tktk">read the PARAT documentation</ExternalLink></>,
      topIndustryAreasTable: <>For details on how we identify use cases in AI patents, <ExternalLink href="tktk">read the PARAT documentation</ExternalLink></>,
      growthColumnExplanation: "Average year-to-year percentage change for years with non-zero starting values over this interval",
    },
  },
};

export { tooltips };
