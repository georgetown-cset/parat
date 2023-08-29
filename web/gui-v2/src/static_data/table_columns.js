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
    title: "AI publications",
    key: "ai_pubs",
    dataKey: "articles",
    dataSubkey: "ai_publications",
    css: styles.sliderColumn,
    initialCol: true,
    extract: (_val, row) => row.articles.ai_publications.total,
    format: (_val, row) => <CellStat data={row.articles.ai_publications} />,
    sortable: true,
    type: 'slider',
  },
  {
    title: "AI patents",
    key: "ai_patents",
    dataKey: "patents",
    dataSubkey: "ai_patents",
    css: styles.sliderColumn,
    initialCol: true,
    extract: (_val, row) => row.patents.ai_patents.total,
    format: (_val, row) => <CellStat data={row.patents.ai_patents} />,
    sortable: true,
    type: 'slider',
  },
  // { title: "AI publication intensity", key: "ai_pubs_int", initialCol: false, type: 'slider' },
  // { title: "NLP publications", key: "nlp_pubs", initialCol: true },
  // { title: "NLP patents", key: "nlp_patents", initialCol: true },
  // { title: "CV publications", key: "cv_pubs", initialCol: false },
  // { title: "CV patents", key: "cv_patents", initialCol: false },
  // { title: "Robotics publications", key: "ro_pubs", initialCol: false },
  // { title: "Robotics patents", key: "ro_patents", initialCol: false },
  // { title: "tt1 jobs (??)", key: "tt1_jobs", initialCol: false },
  // { title: "AI jobs", key: "ai_jobs", initialCol: false },
  // { title: "Stock ticker", key: "market_list", type: "stock" },
];
