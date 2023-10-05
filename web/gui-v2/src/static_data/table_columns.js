import React from 'react';
import { Link } from 'gatsby';
import { css } from '@emotion/react';

import CellStat from '../components/CellStat';
import { slugifyCompanyName } from '../util';

const styles = {
  name: css`
    .MuiTableSortLabel-root {
      width: 100%;
    }
  `,
  sliderColumn: css`
    width: 120px;

    .MuiButtonBase-root {
      width: 100%;
    }
  `,
};

/** Default values for slider columns */
const SLIDER_PRESETS = {
  css: styles.slider,
  initialCol: false,
  sortable: true,
  type: 'slider',
};

/**
 * Helper function to define the `extract` and `format` functions in a consistent
 * way across all columns.
 *
 * @param {string} dataKey
 * @param {string} dataSubkey
 * @returns {{
 *  dataKey: string,
 *  dataSubkey: string,
 *  extract: (val: any, row: object) => any,
 *  format: (val: any, row: object) => ReactNode,
 * }}
 */
const generateDataFns = (dataKey, dataSubkey) => {
  return {
    dataKey,
    dataSubkey,
    extract: (_val, row) => {
      const res = row[dataKey][dataSubkey].total;
      return res === null ? 0 : res;
    },
    format: (_val, row) => <CellStat data={row[dataKey][dataSubkey]} />,
  }
};

export default [
  {
    title: "Company",
    key: "name",
    css: styles.name,
    format: (name, row) => <Link to={`company/${row.cset_id}-${slugifyCompanyName(name)}`}>{name}</Link>,
    initialCol: true,
    sortable: true,
    type: 'dropdown',
  },
  { title: "Country", key: "country", initialCol: true, type: 'dropdown' },
  { title: "Region", key: "continent", initialCol: true, type: 'dropdown' },
  { title: "Stage", key: "stage", initialCol: true, type: 'dropdown' },

  {
    title: "All publications",
    key: "all_pubs",
    ...generateDataFns("articles", "all_publications"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Citation counts",
    key: "citations",
    ...generateDataFns("articles", "citation_counts"),
    ...SLIDER_PRESETS,
  },
  {
    title: "AI publications",
    key: "ai_pubs",
    ...generateDataFns("articles", "ai_publications"),
    ...SLIDER_PRESETS,
    initialCol: true,
  },
  {
    title: "AI publications in top conferences",
    key: "ai_pubs_top_conf",
    ...generateDataFns("articles", "ai_pubs_top_conf"),
    ...SLIDER_PRESETS,
  },
  {
    title: "AI patents",
    key: "ai_patents",
    ...generateDataFns("patents", "ai_patents"),
    ...SLIDER_PRESETS,
    initialCol: true,
  },
  {
    title: "CV publications",
    key: "cv_pubs",
    ...generateDataFns("articles", "cv_pubs"),
    ...SLIDER_PRESETS,
  },
  {
    title: "NLP publications",
    key: "nlp_pubs",
    ...generateDataFns("articles", "nlp_pubs"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Robotics publications",
    key: "ro_pubs",
    ...generateDataFns("articles", "robotics_pubs"),
    ...SLIDER_PRESETS,
  },

  {
    title: "Agricultural patents",
    key: "agri_patents",
    ...generateDataFns("patents", "Agricultural"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Banking and finance patents",
    key: "finance_patents",
    ...generateDataFns("patents", "Banking_and_Finance"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Business patents",
    key: "business_patents",
    ...generateDataFns("patents", "Business"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Computing in government patents",
    key: "comp_in_gov_patents",
    ...generateDataFns("patents", "Computing_in_Government"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Document management and publishing patents",
    key: "doc_mgt_patents",
    ...generateDataFns("patents", "Document_Mgt_and_Publishing"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Education patents",
    key: "edu_patents",
    ...generateDataFns("patents", "Education"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Energy patents",
    key: "energy_mgt_patents",
    ...generateDataFns("patents", "Energy_Management"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Entertainment patents",
    key: "entertain_patents",
    ...generateDataFns("patents", "Entertainment"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Industrial and manufacturing patents",
    key: "industry_patents",
    ...generateDataFns("patents", "Industrial_and_Manufacturing"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Life sciences patents",
    key: "life_patents",
    ...generateDataFns("patents", "Life_Sciences"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Military patents",
    key: "mil_patents",
    ...generateDataFns("patents", "Military"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Nanotechnology patents",
    key: "nano_patents",
    ...generateDataFns("patents", "Nanotechnology"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Networks patents",
    key: "network_patents",
    ...generateDataFns("patents", "Networks__eg_social_IOT_etc"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Personal devices and computing patents",
    key: "personal_comp_patents",
    ...generateDataFns("patents", "Personal_Devices_and_Computing"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Physical sciences and engineering patents",
    key: "phys_sci_patents",
    ...generateDataFns("patents", "Physical_Sciences_and_Engineering"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Security patents",
    key: "security_patents",
    ...generateDataFns("patents", "Security__eg_cybersecurity"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Semiconductor patents",
    key: "semiconductor_patents",
    ...generateDataFns("patents", "Semiconductors"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Telecommunications patents",
    key: "telecom_patents",
    ...generateDataFns("patents", "Telecommunications"),
    ...SLIDER_PRESETS,
  },
  {
    title: "Transportation patents",
    key: "transport_patents",
    ...generateDataFns("patents", "Transportation"),
    ...SLIDER_PRESETS,
  },

  {
    title: "AI jobs",
    key: "ai_jobs",
    ...generateDataFns("other_metrics", "ai_jobs"),
    ...SLIDER_PRESETS,
    initialCol: true,
  },
  {
    title: "Tech Tier 1 jobs",
    key: "tt1_jobs",
    ...generateDataFns("other_metrics", "tt1_jobs"),
    ...SLIDER_PRESETS,
  },
];
