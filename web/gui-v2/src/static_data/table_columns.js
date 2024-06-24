import React from 'react';
import { css } from '@emotion/react';

import { tooltips } from './tooltips';
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
    category: "basic",
    css: [styles.name, columnWidth(200)],
    format: (name, row) => {
      if ( row.cset_id >= GROUP_OFFSET ) {
        return <>{name} (average)</>;
      } else {
        return (
          <a
            target="_blank"
            href={`company/${row.cset_id}-${slugifyCompanyName(name)}/`}
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
    category: "basic",
    css: columnWidth(120),
    initialCol: true,
    dropdownWidth: 180,
    sortable: true,
    type: 'dropdown',
  },
  {
    title: "Region",
    key: "continent",
    category: "basic",
    css: columnWidth(100),
    initialCol: false,
    dropdownWidth: 170,
    sortable: true,
    type: 'dropdown',
  },
  {
    title: "Stage",
    key: "stage",
    category: "basic",
    css: columnWidth(80),
    initialCol: false,
    dropdownWidth: 120,
    sortable: true,
    type: 'dropdown',
  },
  {
    title: "Sector",
    key: "sector",
    category: "basic",
    initialCol: false,
    sortable: true,
    type: 'dropdown',
  },

  {
    title: "AI publications",
    key: "ai_pubs",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "ai_publications"),
    initialCol: true,
  },
  {
    title: "Recent AI pubs growth",
    key: "ai_pubs_growth",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef(
      "articles",
      "ai_publications_growth",
      undefined, // Use the default extractFn
      (_val, row, _extract) => {
        const { total, rank } = row.articles.ai_publications_growth;
        return <CellStat data={{ total, rank }} isPercent={true} />;
      },
    ),
    isGrowthStat: true,
  },
  {
    title: "Highly-cited AI articles",
    key: "highly_cited_ai_pubs",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "highly_cited_ai_pubs"),
  },
  {
    title: "AI publication percentage",
    key: "ai_pubs_percent",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef(
      "articles",
      "ai_pubs_percent",
      undefined, // Use the default extractFn
      (_val, row, _extract) => {
        const { total, rank } = row.articles.ai_pubs_percent;
        return <CellStat data={{ total, rank }} isPercent={true} />
      },
    ),
    isPercent: true,
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
    category: "publications",
    ...generateSliderColDef("articles", "ai_pubs_top_conf"),
  },
  {
    title: "CV publications",
    key: "cv_publications",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "cv_publications"),
  },
  {
    title: "NLP publications",
    key: "nlp_publications",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "nlp_publications"),
  },
  {
    title: "Robotics publications",
    key: "robotics_publications",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "robotics_publications"),
  },
  {
    title: "All publications",
    key: "all_pubs",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "all_publications"),
  },
  {
    title: "Citations to AI pubs",
    key: "citations",
    aggregateType: "median",
    category: "publications",
    ...generateSliderColDef("articles", "ai_citation_counts"),
  },

  {
    title: "AI patents",
    key: "ai_patents",
    aggregateType: "median",
    category: "patents",
    ...generateSliderColDef("patents", "ai_patents"),
    initialCol: true,
  },
  {
    title: "AI patents recent growth",
    key: "ai_patents_growth",
    aggregateType: "median",
    category: "patents",
    ...generateSliderColDef(
      "patents",
      "ai_patents_growth",
      undefined, // Use the default extractFn
      (_val, row, _extract) => {
        const { total, rank } = row.patents.ai_patents_growth;
        return <CellStat data={{ total, rank }} isPercent={true} />;
      },
    ),
    isGrowthStat: true,
  },
  {
    title: "AI patent percentage",
    key: "ai_patents_percent",
    aggregateType: "median",
    category: "patents",
    ...generateSliderColDef(
      "patents",
      "ai_patents_percent",
      undefined, // Use the default extractFn
      (_val, row, _extract) => {
        const { total, rank } = row.patents.ai_patents_percent;
        return <CellStat data={{ total, rank }} isPercent={true} />
      },
    ),
    isPercent: true,
  },
  {
    title: "Granted AI patents",
    key: "ai_patents_grants",
    aggregateType: "median",
    category: "patents",
    ...generateSliderColDef("patents", "ai_patents_grants"),
  },
  {
    title: "All patents",
    key: "all_patents",
    aggregateType: "median",
    category: "patents",
    ...generateSliderColDef("patents", "all_patents"),
  },
  {
    title: "Agricultural patents",
    key: "agri_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Agricultural"),
  },
  {
    title: "Analytics and algorithms patents",
    key: "algorithms",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Analytics_and_Algorithms"),
  },
  {
    title: "Banking and finance patents",
    key: "finance_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Banking_and_Finance"),
  },
  {
    title: "Business patents",
    key: "business_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Business"),
  },
  {
    title: "Computer vision patents",
    key: "comp_vision",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Computer_Vision"),
  },
  {
    title: "Computing in government patents",
    key: "comp_in_gov_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Computing_in_Government"),
  },
  {
    title: "Control patents",
    key: "control",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Control"),
  },
  {
    title: "Distributed AI patents",
    key: "distributed_ai",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Distributed_AI"),
  },
  {
    title: "Document management and publishing patents",
    key: "doc_mgt_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Document_Mgt_and_Publishing"),
  },
  {
    title: "Education patents",
    key: "edu_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Education"),
  },
  {
    title: "Energy patents",
    key: "energy_mgt_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Energy_Management"),
  },
  {
    title: "Entertainment patents",
    key: "entertain_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Entertainment"),
  },
  {
    title: "Industrial and manufacturing patents",
    key: "industry_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Industrial_and_Manufacturing"),
  },
  {
    title: "Knowledge representation patents",
    key: "knowledge_rep",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Knowledge_Representation"),
  },
  {
    title: "Language processing patents",
    key: "lang_process",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Language_Processing"),
  },
  {
    title: "Life sciences patents",
    key: "life_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Life_Sciences"),
  },
  {
    title: "Measuring and testing patents",
    key: "measure_test",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Measuring_and_Testing"),
  },
  {
    title: "Military patents",
    key: "mil_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Military"),
  },
  {
    title: "Nanotechnology patents",
    key: "nano_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Nanotechnology"),
  },
  {
    title: "Networks patents",
    key: "network_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Networks__eg_social_IOT_etc"),
  },
  {
    title: "Personal devices and computing patents",
    key: "personal_comp_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Personal_Devices_and_Computing"),
  },
  {
    title: "Physical sciences and engineering patents",
    key: "phys_sci_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Physical_Sciences_and_Engineering"),
  },
  {
    title: "Planning and scheduling patents",
    key: "plan_sched",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Planning_and_Scheduling"),
  },
  {
    title: "Robotics patents",
    key: "robotics",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Robotics"),
  },
  {
    title: "Security patents",
    key: "security_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Security__eg_cybersecurity"),
  },
  {
    title: "Semiconductor patents",
    key: "semiconductor_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Semiconductors"),
  },
  {
    title: "Speech processing patents",
    key: "speech",
    aggregateType: "median",
    category: "patents:applications",
    ...generateSliderColDef("patents", "Speech_Processing"),
  },
  {
    title: "Telecommunications patents",
    key: "telecom_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Telecommunications"),
  },
  {
    title: "Transportation patents",
    key: "transport_patents",
    aggregateType: "median",
    category: "patents:use-cases",
    ...generateSliderColDef("patents", "Transportation"),
  },
  {
    title: "AI jobs",
    key: "ai_jobs",
    aggregateType: "median",
    category: "workforce",
    ...generateSliderColDef(
      "other_metrics",
      "ai_jobs",
      undefined, // Use default extract function
      (_val, row) => {
        const data = (row?._group || row.linkedin.length > 0) ? row.other_metrics.ai_jobs : {total: null};
        return <CellStat col="ai_jobs" country={row.country} data={data} />;
      },
    ),
    initialCol: true,
  },
  {
    title: "Tech Tier 1 jobs",
    key: "tt1_jobs",
    aggregateType: "median",
    category: "workforce",
    ...generateSliderColDef(
      "other_metrics",
      "tt1_jobs",
      undefined, // Use default extract function
      (_val, row) => {
        const data = (row?._group || row.linkedin.length > 0) ? row.other_metrics.tt1_jobs : {total: null};
        return <CellStat col="tt1_jobs" country={row.country} data={data} />;
      },
    ),
  },
// Apply tooltips to the column definition entries
].map((entry) => ({ ...entry, tooltip: tooltips.columnHeaders[entry.key] }));
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

/**
 * Group the columns by the category under which they are displayed in the
 * column selection modal.  For simplicity, there is only one level - the patent
 * subgroups are at the same level as the top-level patents.
 */
export const columnsByCategory = columnDefinitions
  .map(def => ([def.category, def]))
  .reduce((acc, [cat, def]) => {
    if ( Object.hasOwn(acc, cat) ) {
      acc[cat].push(def);
    } else {
      acc[cat] = [ def ];
    }
    return acc;
  }, {});
