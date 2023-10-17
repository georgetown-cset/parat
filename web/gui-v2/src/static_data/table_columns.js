import React from 'react';
import { css } from '@emotion/react';

import overall from '../static_data/overall_data.json';
import CellStat from '../components/CellStat';
import { slugifyCompanyName } from '../util';

const startArticleIx = overall.years.findIndex(e => e === overall.startArticleYear);
const endArticleIx = overall.years.findIndex(e => e === overall.endArticleYear);

const styles = {
  name: css`
    .MuiTableSortLabel-root {
      width: 100%;
    }
  `,
  sliderColumn: css`
    min-width: 100px;
    width: 120px;

    .MuiButtonBase-root {
      width: 100%;
    }
  `,
};

/**
 * Helper function to define the `extract` and `format` functions of slider
 * fields in a consistent way across all columns.
 *
 * @param {string} dataKey
 * @param {string} dataSubkey
 * @param {undefined|(val: any, row: object) => any} extractFn
 * @param {undefined|(val: any, row: object, extract: ExtractFn) => ReactNode} formatFn
 * @returns {{
 *  css: SerializedStyles,
 *  dataKey: string,
 *  dataSubkey: string,
 *  extract: (val: any, row: object) => any,
 *  format: (val: any, row: object, extract: ExtractFn) => ReactNode,
 *  initialCol: boolean,
 *  sortable: boolean,
 *  type: 'dropdown'|'slider',
 * }}
 */
const generateSliderColDef = (dataKey, dataSubkey, extractFn, formatFn) => {
  return {
    css: styles.sliderColumn,
    dataKey,
    dataSubkey,
    extract: extractFn ?? ((_val, row) => {
      const res = row[dataKey][dataSubkey].total;
      return res === null ? 0 : res;
    }),
    format: formatFn ?? ((_val, row) => <CellStat data={row[dataKey][dataSubkey]} />),
    initialCol: false,
    sortable: true,
    type: 'slider',
  }
};

const columnDefinitions = [
  {
    title: "Company",
    key: "name",
    css: styles.name,
    format: (name, row) => (
      <a
        target="_blank"
        href={`company/${row.cset_id}-${slugifyCompanyName(name)}`}
      >
        {name}
      </a>
    ),
    initialCol: true,
    minWidth: 240,
    sortable: true,
    type: 'dropdown',
  },
  {
    title: "Country",
    key: "country",
    initialCol: true,
    minWidth: 180,
    type: 'dropdown',
  },
  {
    title: "Region",
    key: "continent",
    initialCol: false,
    minWidth: 170,
    type: 'dropdown',
  },
  {
    title: "Stage",
    key: "stage",
    initialCol: false,
    minWidth: 120,
    type: 'dropdown',
  },
  {
    title: "Sector",
    key: "sector",
    initialCol: false,
    minWidth: 200,
    type: 'dropdown',
  },

  {
    title: "All publications",
    key: "all_pubs",
    ...generateSliderColDef("articles", "all_publications"),
  },
  {
    title: "5-year growth in publications",
    key: "all_pubs_growth",
    ...generateSliderColDef(
      "articles",
      "all_publications",
      ((_val, row) => {
        const data = row.articles.all_publications;
        const startVal = data.counts[startArticleIx];
        return Math.round((data.counts[endArticleIx] - startVal) / startVal * 1000) / 10;
      }),
      (val, row, extract) => {
        const extractedVal = extract(val, row);
        const total = extractedVal ? `${extractedVal.toFixed(1)}%` : '---';
        return <CellStat data={{ total }} />;
      },
    ),
  },
  {
    title: "Citation counts",
    key: "citations",
    ...generateSliderColDef("articles", "citation_counts"),
  },
  {
    title: "AI publications",
    key: "ai_pubs",
    ...generateSliderColDef("articles", "ai_publications"),
    initialCol: true,
  },
  {
    title: "AI publications in top conferences",
    key: "ai_pubs_top_conf",
    ...generateSliderColDef("articles", "ai_pubs_top_conf"),
  },
  {
    title: "CV publications",
    key: "cv_pubs",
    ...generateSliderColDef("articles", "cv_pubs"),
  },
  {
    title: "NLP publications",
    key: "nlp_pubs",
    ...generateSliderColDef("articles", "nlp_pubs"),
  },
  {
    title: "Robotics publications",
    key: "ro_pubs",
    ...generateSliderColDef("articles", "robotics_pubs"),
  },

  {
    title: "AI patents",
    key: "ai_patents",
    ...generateSliderColDef("patents", "ai_patents"),
    initialCol: true,
  },
  {
    title: "Agricultural patents",
    key: "agri_patents",
    ...generateSliderColDef("patents", "Agricultural"),
  },
  {
    title: "Analytics and algorithms patents",
    key: "algorithms",
    ...generateSliderColDef("patents", "Analytics_and_Algorithms"),
  },
  {
    title: "Banking and finance patents",
    key: "finance_patents",
    ...generateSliderColDef("patents", "Banking_and_Finance"),
  },
  {
    title: "Business patents",
    key: "business_patents",
    ...generateSliderColDef("patents", "Business"),
  },
  {
    title: "Computer vision patents",
    key: "comp_vision",
    ...generateSliderColDef("patents", "Computer_Vision"),
  },
  {
    title: "Computing in government patents",
    key: "comp_in_gov_patents",
    ...generateSliderColDef("patents", "Computing_in_Government"),
  },
  {
    title: "Control patents",
    key: "control",
    ...generateSliderColDef("patents", "Control"),
  },
  {
    title: "Distributed AI patents",
    key: "distributed_ai",
    ...generateSliderColDef("patents", "Distributed_AI"),
  },
  {
    title: "Document management and publishing patents",
    key: "doc_mgt_patents",
    ...generateSliderColDef("patents", "Document_Mgt_and_Publishing"),
  },
  {
    title: "Education patents",
    key: "edu_patents",
    ...generateSliderColDef("patents", "Education"),
  },
  {
    title: "Energy patents",
    key: "energy_mgt_patents",
    ...generateSliderColDef("patents", "Energy_Management"),
  },
  {
    title: "Entertainment patents",
    key: "entertain_patents",
    ...generateSliderColDef("patents", "Entertainment"),
  },
  {
    title: "Industrial and manufacturing patents",
    key: "industry_patents",
    ...generateSliderColDef("patents", "Industrial_and_Manufacturing"),
  },
  {
    title: "Knowledge representation patents",
    key: "knowledge_rep",
    ...generateSliderColDef("patents", "Knowledge_Representation"),
  },
  {
    title: "Language processing patents",
    key: "lang_process",
    ...generateSliderColDef("patents", "Language_Processing"),
  },
  {
    title: "Life sciences patents",
    key: "life_patents",
    ...generateSliderColDef("patents", "Life_Sciences"),
  },
  {
    title: "Measuring and testing patents",
    key: "measure_test",
    ...generateSliderColDef("patents", "Measuring_and_Testing"),
  },
  {
    title: "Military patents",
    key: "mil_patents",
    ...generateSliderColDef("patents", "Military"),
  },
  {
    title: "Nanotechnology patents",
    key: "nano_patents",
    ...generateSliderColDef("patents", "Nanotechnology"),
  },
  {
    title: "Networks patents",
    key: "network_patents",
    ...generateSliderColDef("patents", "Networks__eg_social_IOT_etc"),
  },
  {
    title: "Personal devices and computing patents",
    key: "personal_comp_patents",
    ...generateSliderColDef("patents", "Personal_Devices_and_Computing"),
  },
  {
    title: "Physical sciences and engineering patents",
    key: "phys_sci_patents",
    ...generateSliderColDef("patents", "Physical_Sciences_and_Engineering"),
  },
  {
    title: "Planning and scheduling patents",
    key: "plan_sched",
    ...generateSliderColDef("patents", "Planning_and_Scheduling"),
  },
  {
    title: "Robotics patents",
    key: "robotics",
    ...generateSliderColDef("patents", "Robotics"),
  },
  {
    title: "Security patents",
    key: "security_patents",
    ...generateSliderColDef("patents", "Security__eg_cybersecurity"),
  },
  {
    title: "Semiconductor patents",
    key: "semiconductor_patents",
    ...generateSliderColDef("patents", "Semiconductors"),
  },
  {
    title: "Speech processing patents",
    key: "speech",
    ...generateSliderColDef("patents", "Speech_Processing"),
  },
  {
    title: "Telecommunications patents",
    key: "telecom_patents",
    ...generateSliderColDef("patents", "Telecommunications"),
  },
  {
    title: "Transportation patents",
    key: "transport_patents",
    ...generateSliderColDef("patents", "Transportation"),
  },

  {
    title: "AI jobs",
    key: "ai_jobs",
    ...generateSliderColDef("other_metrics", "ai_jobs"),
  },
  {
    title: "Tech Tier 1 jobs",
    key: "tt1_jobs",
    ...generateSliderColDef("other_metrics", "tt1_jobs"),
    initialCol: true,
  },
];
export default columnDefinitions;

export const articleMap = Object.fromEntries(columnDefinitions
  .filter(e => e.dataKey === 'articles')
  .map(e => ([e.dataSubkey, e.title]))
);

export const patentMap = Object.fromEntries(columnDefinitions
  .filter(e => e.dataKey === 'patents')
  .map(e => ([e.dataSubkey, e.title]))
);

export const otherMetricMap = Object.fromEntries(columnDefinitions
  .filter(e => e.dataKey === 'other_metrics')
  .map(e => ([e.dataSubkey, e.title]))
);
