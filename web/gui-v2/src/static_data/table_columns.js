import React from 'react';
import { css } from '@emotion/react';

import overall from '../static_data/overall_data.json';
import CellStat from '../components/CellStat';
import { slugifyCompanyName } from '../util';

const startArticleIx = overall.years.findIndex(e => e === overall.startArticleYear);
const endArticleIx = overall.years.findIndex(e => e === overall.endArticleYear);
const startPatentIx = overall.years.findIndex(e => e === overall.startPatentYear);
const endPatentIx = overall.years.findIndex(e => e === overall.endPatentYear);

const styles = {
  name: css`
    .MuiTableSortLabel-root {
      width: 100%;
    }
  `,
};

const columnWidth = (width, isSlider=false) => {
  if ( isSlider ) {
    return css`
      min-width: ${width}px;
      width: ${width}px;

      .MuiButtonBase-root {
        width: 100%;
      }
    `;
  } else {
    return css`
      min-width: ${width}px;
    `;
  }
};

/**
 * Extract a complex result from the company data for the given column.  Can be
 * used when a subkey is a more complex object, or in situations where the
 * desired data is a combination of values from multiple keys/subkeys.
 * @typedef {(val: any, row: object) => any} ExtractFn
 */

/**
 * Format a cell's value, or the result of its `extract` function, for display
 * in the list view table.
 * @typedef {(val: any, row: object, extract: ExtractFn) => ReactNode} FormatFn
 */

/**
 * The definition for each column of data presented in the list view.
 *
 * There are two types of columns - **inherent** and **derived**.  An inherent
 * column directly uses values as they are within the data, perhaps with some
 * minor extraction/formatting logic.  A derived column, however, does more
 * extensive transforms, often including using the same underlying data as an
 * inherent column but presenting it in a different manner.
 * @typedef {{
 *    css: SerializedStyles,
 *    dataKey: string,
 *    dataSubkey: string,
 *    extract: ExtractFn,
 *    format: FormatFn,
 *    key: string,
 *    initialCol: boolean,
 *    isDerived?: boolean,
 *    isGrowthStat?: boolean,
 *    minWidth?: number,
 *    sortable: boolean,
 *    title: string,
 *    tooltip?: string,
 *    type: 'dropdown'|'slider',
 * }} ColumnDefinition
 */

/**
 * Helper function to define the `extract` and `format` functions of slider
 * fields in a consistent way across all columns.
 *
 * @param {string} dataKey
 * @param {string} dataSubkey
 * @param {undefined|(val: any, row: object) => any} extractFn
 * @param {undefined|(val: any, row: object, extract: ExtractFn) => ReactNode} formatFn
 * @returns {{
 *    css: SerializedStyles,
 *    dataKey: string,
 *    dataSubkey: string,
 *    extract: ExtractFn,
 *    format: FormatFn,
 *    initialCol: boolean,
 *    isDerived: boolean,
 *    sortable: boolean,
 *    type: 'dropdown'|'slider',
 * }}
 */
const generateSliderColDef = (dataKey, dataSubkey, extractFn, formatFn) => {
  return {
    css: columnWidth(120, true),
    dataKey,
    dataSubkey,
    extract: extractFn ?? ((_val, row) => {
      const res = row[dataKey][dataSubkey].total;
      return res === null ? 0 : res;
    }),
    format: formatFn ?? ((_val, row) => <CellStat data={row[dataKey][dataSubkey]} />),
    initialCol: false,
    isDerived: false,
    sortable: true,
    type: 'slider',
  }
};

const columnDefinitions = [
  {
    title: "Company",
    key: "name",
    css: [styles.name, columnWidth(200)],
    format: (name, row) => (
      <a
        target="_blank"
        href={`company/${row.cset_id}-${slugifyCompanyName(name)}`}
      >
        {name}
      </a>
    ),
    initialCol: true,
    dropdownWidth: 240,
    sortable: true,
    type: 'companyName',
  },
  {
    title: "Country",
    key: "country",
    css: columnWidth(120),
    initialCol: true,
    dropdownWidth: 180,
    type: 'dropdown',
  },
  {
    title: "Region",
    key: "continent",
    css: columnWidth(100),
    initialCol: false,
    dropdownWidth: 170,
    type: 'dropdown',
  },
  {
    title: "Stage",
    key: "stage",
    css: columnWidth(80),
    initialCol: false,
    dropdownWidth: 120,
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
    title: "5-year total publications",
    key: "all_pubs_5yr",
    ...generateSliderColDef(
      "articles",
      "all_publications",
      ((_val, row) => {
        const data = row.articles.all_publications;
        return data.counts.slice(startArticleIx, endArticleIx+1).reduce((acc, curr) => acc + curr);
      }),
      (val, row, extract) => {
        return <CellStat data={{ total: extract(val, row) }} />;
      },
    ),
    isDerived: true,
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
    title: "Recent AI pubs growth",
    key: "ai_pubs_growth",
    ...generateSliderColDef(
      "articles",
      "ai_publications_growth",
      undefined, // Use the default extractFn
      (_val, row, _extract) => {
        const rawVal = row.articles.ai_publications_growth;
        const total = rawVal.total ? `${rawVal.total.toFixed(2)}%` : '---';
        const rank = rawVal.rank ?? '---';
        return <CellStat data={{ total, rank }} />;
      },
    ),
    isGrowthStat: true,
  },
  {
    title: "AI publication percentage",
    key: "ai_pubs_percent",
    ...generateSliderColDef(
      "articles",
      "ai_publications",
      ((_val, row) => {
        return Math.round(row.articles.ai_publications.total / row.articles.all_publications.total * 1000) / 10;
      }),
      (val, row, extract) => {
        const extractedVal = extract(val, row);
        const total = extractedVal ? `${extractedVal.toFixed(1)}%` : '---';
        return <CellStat data={{ total }} />
      },
    ),
    isDerived: true,
  },
  // TODO, pending clarification of intent
  // {
  //   title: "Citations per AI paper",
  //   key: "citations_per_ai_pub",
  //   ...generateSliderColDef("articles", "??????"),
  // },
  {
    title: "AI publications in top conferences",
    key: "ai_pubs_top_conf",
    ...generateSliderColDef("articles", "ai_pubs_top_conf"),
  },
  {
    title: `AI papers in last complete year (${overall.endArticleYear})`,
    key: "ai_pubs_last_full_year",
    ...generateSliderColDef(
      "articles",
      "ai_publications",
      ((_val, row) => row.articles.ai_publications.counts[endArticleIx]),
      (val, row, extract) => <CellStat data={{ total: extract(val, row) }} />,
    ),
    isDerived: true,
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
    title: "All patents",
    key: "all_patents",
    ...generateSliderColDef("patents", "all_patents"),
  },
  {
    title: "5-year total patents",
    key: "all_patents_5yr",
    ...generateSliderColDef(
      "patents",
      "all_patents",
      ((_val, row) => {
        const data = row.patents.all_patents;
        return data.counts.slice(startPatentIx, endPatentIx+1).reduce((acc, curr) => acc + curr);
      }),
      (val, row, extract) => {
        return <CellStat data={{ total: extract(val, row) }} />;
      },
    ),
    isDerived: true,
  },
  {
    title: "AI patents",
    key: "ai_patents",
    ...generateSliderColDef("patents", "ai_patents"),
    initialCol: true,
  },
  {
    title: "AI patents recent growth",
    key: "ai_patents_growth",
    ...generateSliderColDef(
      "patents",
      "ai_patents_growth",
      undefined, // Use the default extractFn
      (_val, row, _extract) => {
        const rawVal = row.patents.ai_patents_growth;
        const total = rawVal.total ? `${rawVal.total.toFixed(2)}%` : '---';
        const rank = rawVal.rank ?? '---';
        return <CellStat data={{ total, rank }} />;
      },
    ),
    isGrowthStat: true,
  },
  {
    title: "AI patent percentage",
    key: "ai_patents_percent",
    ...generateSliderColDef(
      "patents",
      "ai_patents",
      ((_val, row) => {
        return Math.round(row.patents.ai_patents.total / row.patents.all_patents.total * 1000) / 10;
      }),
      (val, row, extract) => {
        const extractedVal = extract(val, row);
        const total = extractedVal ? `${extractedVal.toFixed(1)}%` : '---';
        return <CellStat data={{ total }} />
      },
    ),
    isDerived: true,
  },
  {
    title: "Granted AI patents",
    key: "ai_patents_grants",
    ...generateSliderColDef("patents", "ai_patents_grants"),
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


/**
 * Map from column keys to their displayed titles.
 */
export const columnKeyMap = Object.fromEntries(
  columnDefinitions.map(e => ([e.key, e.title]))
);

/**
 * Map from the inherent keys present in the data (`data.articles[SOMETHING]`)
 * to a human-friendly name for the column/data.  Can only be used on inherent,
 * not derived, columns.
 */
export const articleMap = Object.fromEntries(columnDefinitions
  .filter(e => e.dataKey === 'articles')
  .map(e => ([e.dataSubkey, e.title]))
);

/**
 * Map from the inherent keys present in the data (`data.patents[SOMETHING]`)
 * to a human-friendly name for the column/data.  Can only be used on inherent,
 * not derived, columns.
 */
export const patentMap = Object.fromEntries(columnDefinitions
  .filter(e => !e?.isDerived && e.dataKey === 'patents')
  .map(e => ([e.dataSubkey, e.title]))
);

export const otherMetricMap = Object.fromEntries(columnDefinitions
  .filter(e => e.dataKey === 'other_metrics')
  .map(e => ([e.dataSubkey, e.title]))
);
