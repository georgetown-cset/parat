import React from 'react';
import { css } from '@emotion/react';

import overall from '../static_data/overall_data.json';
import CellStat from '../components/CellStat';
import { slugifyCompanyName } from '../util';

const startArticleIx = overall.years.findIndex(e => e === overall.startArticleYear);
const endArticleIx = overall.years.findIndex(e => e === overall.endArticleYear);
const startPatentIx = overall.years.findIndex(e => e === overall.startPatentYear);
const endPatentIx = overall.years.findIndex(e => e === overall.endPatentYear);

// Start of the fake `cset_id` values used for company groups.
const GROUP_OFFSET = overall.groupIdOffset;

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
 *    aggregateType?: 'median'|'sum',
 *    css: SerializedStyles,
 *    dataKey: string,
 *    dataSubkey: string,
 *    extract: ExtractFn,
 *    format: FormatFn,
 *    key: string,
 *    initialCol: boolean,
 *    isDerived?: boolean,
 *    isGrowthStat?: boolean,
 *    isPercent?: boolean,
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
    css: columnWidth(135, true),
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
    format: (name, row) => {
      if ( row.cset_id >= GROUP_OFFSET ) {
        return <>{name} (average)</>;
      } else {
        return (
          <a
            target="_blank"
            href={`company/${row.cset_id}-${slugifyCompanyName(name)}`}
          >
            {name}
          </a>
        )
      }
    },
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
    tooltip: "Zach_tktk",
  },
  {
    title: "Region",
    key: "continent",
    css: columnWidth(100),
    initialCol: false,
    dropdownWidth: 170,
    type: 'dropdown',
    tooltip: "Zach_tktk",
  },
  {
    title: "Stage",
    key: "stage",
    css: columnWidth(80),
    initialCol: false,
    dropdownWidth: 120,
    type: 'dropdown',
    tooltip: "Zach_tktk",
  },
  {
    title: "Sector",
    key: "sector",
    initialCol: false,
    type: 'dropdown',
    tooltip: "Zach_tktk",
  },

  {
    title: "All publications",
    key: "all_pubs",
    aggregateType: "median",
    ...generateSliderColDef("articles", "all_publications"),
    tooltip: "Zach_tktk",
  },
  {
    title: "5-year total publications",
    key: "all_pubs_5yr",
    aggregateType: "median",
    ...generateSliderColDef(
      "articles",
      "all_pubs_5yr"
    ),
    tooltip: "Zach_tktk",
  },
  {
    title: "Citation counts",
    key: "citations",
    aggregateType: "median",
    ...generateSliderColDef("articles", "ai_citation_counts"),
    tooltip: "Zach_tktk",
  },
  {
    title: "AI publications",
    key: "ai_pubs",
    aggregateType: "median",
    ...generateSliderColDef("articles", "ai_publications"),
    initialCol: true,
    tooltip: "Zach_tktk",
  },
  {
    title: "Recent AI pubs growth",
    key: "ai_pubs_growth",
    aggregateType: "median",
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
    tooltip: "Zach_tktk",
  },
  {
    title: "AI publication percentage",
    key: "ai_pubs_percent",
    aggregateType: "median",
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
    isPercent: true,
    tooltip: "Zach_tktk",
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
    aggregateType: "median",
    ...generateSliderColDef("articles", "ai_pubs_top_conf"),
    tooltip: "Zach_tktk",
  },
  {
    title: `AI papers in last complete year (${overall.endArticleYear})`,
    key: "ai_pubs_last_full_year",
    aggregateType: "median",
    ...generateSliderColDef(
      "articles",
      "ai_publications",
      ((_val, row) => row.articles.ai_publications.counts[endArticleIx]),
      (val, row, extract) => <CellStat data={{ total: extract(val, row) }} />,
    ),
    isDerived: true,
    tooltip: "Zach_tktk",
  },
  {
    title: "CV publications",
    key: "cv_publications",
    aggregateType: "median",
    ...generateSliderColDef("articles", "cv_publications"),
    tooltip: "Zach_tktk",
  },
  {
    title: "NLP publications",
    key: "nlp_publications",
    aggregateType: "median",
    ...generateSliderColDef("articles", "nlp_publications"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Robotics publications",
    key: "robotics_publications",
    aggregateType: "median",
    ...generateSliderColDef("articles", "robotics_publications"),
    tooltip: "Zach_tktk",
  },

  {
    title: "All patents",
    key: "all_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "all_patents"),
    tooltip: "Zach_tktk",
  },
  {
    title: "5-year total patents",
    key: "all_patents_5yr",
    aggregateType: "median",
    ...generateSliderColDef(
      "patents",
      "all_patents_5yr"
    ),
    tooltip: "Zach_tktk",
  },
  {
    title: "AI patents",
    key: "ai_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "ai_patents"),
    initialCol: true,
    tooltip: "Zach_tktk",
  },
  {
    title: "AI patents recent growth",
    key: "ai_patents_growth",
    aggregateType: "median",
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
    tooltip: "Zach_tktk",
  },
  {
    title: "AI patent percentage",
    key: "ai_patents_percent",
    aggregateType: "median",
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
    isPercent: true,
    tooltip: "Zach_tktk",
  },
  {
    title: "Granted AI patents",
    key: "ai_patents_grants",
    aggregateType: "median",
    ...generateSliderColDef("patents", "ai_patents_grants"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Agricultural patents",
    key: "agri_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Agricultural"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Analytics and algorithms patents",
    key: "algorithms",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Analytics_and_Algorithms"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Banking and finance patents",
    key: "finance_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Banking_and_Finance"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Business patents",
    key: "business_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Business"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Computer vision patents",
    key: "comp_vision",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Computer_Vision"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Computing in government patents",
    key: "comp_in_gov_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Computing_in_Government"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Control patents",
    key: "control",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Control"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Distributed AI patents",
    key: "distributed_ai",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Distributed_AI"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Document management and publishing patents",
    key: "doc_mgt_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Document_Mgt_and_Publishing"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Education patents",
    key: "edu_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Education"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Energy patents",
    key: "energy_mgt_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Energy_Management"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Entertainment patents",
    key: "entertain_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Entertainment"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Industrial and manufacturing patents",
    key: "industry_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Industrial_and_Manufacturing"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Knowledge representation patents",
    key: "knowledge_rep",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Knowledge_Representation"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Language processing patents",
    key: "lang_process",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Language_Processing"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Life sciences patents",
    key: "life_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Life_Sciences"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Measuring and testing patents",
    key: "measure_test",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Measuring_and_Testing"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Military patents",
    key: "mil_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Military"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Nanotechnology patents",
    key: "nano_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Nanotechnology"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Networks patents",
    key: "network_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Networks__eg_social_IOT_etc"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Personal devices and computing patents",
    key: "personal_comp_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Personal_Devices_and_Computing"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Physical sciences and engineering patents",
    key: "phys_sci_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Physical_Sciences_and_Engineering"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Planning and scheduling patents",
    key: "plan_sched",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Planning_and_Scheduling"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Robotics patents",
    key: "robotics",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Robotics"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Security patents",
    key: "security_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Security__eg_cybersecurity"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Semiconductor patents",
    key: "semiconductor_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Semiconductors"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Speech processing patents",
    key: "speech",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Speech_Processing"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Telecommunications patents",
    key: "telecom_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Telecommunications"),
    tooltip: "Zach_tktk",
  },
  {
    title: "Transportation patents",
    key: "transport_patents",
    aggregateType: "median",
    ...generateSliderColDef("patents", "Transportation"),
    tooltip: "Zach_tktk",
  },
  {
    title: "AI jobs",
    key: "ai_jobs",
    aggregateType: "median",
    ...generateSliderColDef(
      "other_metrics",
      "ai_jobs",
      undefined, // Use default extract function
      (_val, row) => {
        if ( row?._group || row.linkedin.length > 0 ) {
          return <CellStat data={row.other_metrics.ai_jobs} />;
        } else {
          return <CellStat data={{ total: null }} />
        }
      },
    ),
    tooltip: "Zach_tktk"
  },
  {
    title: "Tech Tier 1 jobs",
    key: "tt1_jobs",
    aggregateType: "median",
    ...generateSliderColDef(
      "other_metrics",
      "tt1_jobs",
      undefined, // Use default extract function
      (_val, row) => {
        if ( row?._group || row.linkedin.length > 0 ) {
          return <CellStat data={row.other_metrics.tt1_jobs} />;
        } else {
          return <CellStat data={{ total: null }} />
        }
      },
    ),
    initialCol: true,
    tooltip: "Zach_tktk",
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
