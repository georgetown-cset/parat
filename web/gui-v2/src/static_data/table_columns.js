import React from 'react';

import CellStat from '../components/CellStat';

export default [
  { title: "Company", key: "name", initialCol: true, sortable: true, type: 'dropdown' },
  { title: "Country", key: "country", initialCol: true, type: 'dropdown' },
  { title: "Region", key: "continent", initialCol: true, type: 'dropdown' },
  { title: "Stage", key: "stage", initialCol: true, type: 'dropdown' },
  {
    title: "AI publications",
    key: "ai_pubs",
    subkey: "value",
    initialCol: true,
    format: (val) => <CellStat data={val} />,
    sortable: true,
    type: 'slider',
    extract: (val) => val.value,
  },
  {
    title: "AI patents",
    key: "ai_patents",
    subkey: "value",
    initialCol: true,
    format: (val) => <CellStat data={val} />,
    sortable: true,
    type: 'slider',
    extract: (val) => val.value,
  },
  { title: "AI publication intensity", key: "???", initialCol: false, type: 'slider' },
  // { title: "NLP publications", key: "???", initialCol: true },
  // { title: "NLP patents", key: "???", initialCol: true },
  { title: "CV publications", key: "???", initialCol: false },
  { title: "CV patents", key: "???", initialCol: false },
  { title: "Robotics publications", key: "???", initialCol: false },
  { title: "Robotics patents", key: "???", initialCol: false },
  { title: "tt1 jobs (??)", key: "???", initialCol: false },
  { title: "AI jobs", key: "ai_jobs", initialCol: false },
  { title: "Stock ticker", key: "market_list", },
];
