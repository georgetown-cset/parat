import React, { useState } from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

import HeaderWithLink from './HeaderWithLink';
import StatGrid from './StatGrid';
import TableSection from './TableSection';
import TextAndBigStat from './TextAndBigStat';
import TrendsChart from './TrendsChart';
import overall from '../static_data/overall_data.json';
import { patentMap } from '../static_data/table_columns';
import { commas } from '../util';

const styles = {
  section: css`
    margin: 2rem auto 1rem;
    max-width: 808px;

    h3 {
      margin-bottom: 0.5rem;
    }
  `,
  trendsDropdown: css`
    .MuiInputBase-input.MuiSelect-select {
      align-items: center;
      display: flex;
      justify-content: center;
    }
  `,
};

const chartLayoutChanges = {
  legend: {
    groupclick: 'toggleitem',
    y: 1.32,
  },
  margin: { t: 0, r: 50, b: 50, l: 50, pad: 4 },
  yaxis: {
    rangemode: 'tozero',
  },
};

const startIx = overall.years.findIndex(e => e === overall.startPatentYear);
const endIx = overall.years.findIndex(e => e === overall.endPatentYear);

const PATENT_DROPDOWN_CATEGORIES = [
  { text: "AI (all)", key: "ai_patents" },
  {
    header: "Applications",
    subentry_keys: [
      "Analytics_and_Algorithms",
      "Computer_Vision",
      "Control",
      "Distributed_AI",
      "Knowledge_Representation",
      "Language_Processing",
      "Measuring_and_Testing",
      "Planning_and_Scheduling",
      "Robotics",
      "Speech_Processing",
    ],
  },
  {
    header: "Industry areas",
    subentry_keys: [
      "Agricultural",
      "Banking_and_Finance",
      "Business",
      "Computing_in_Government",
      "Document_Mgt_and_Publishing",
      "Education",
      "Energy_Management",
      "Entertainment",
      "Industrial_and_Manufacturing",
      "Life_Sciences",
      "Military",
      "Nanotechnology",
      "Networks__eg_social_IOT_etc",
      "Personal_Devices_and_Computing",
      "Physical_Sciences_and_Engineering",
      "Security__eg_cybersecurity",
      "Semiconductors",
      "Telecommunications",
      "Transportation",
    ],
  },
];

const PATENT_DROPDOWN_OPTIONS = PATENT_DROPDOWN_CATEGORIES
  .flatMap((entry) => {
    const { key, text, header, subentry_keys } = entry;
    if ( key && text ) {
      // Top-level dropdown option, not categorized into a group.
      // (returned as a single-element array b/c flatMap and the other case)
      return [{
        val: key,
        text,
      }];
    } else if ( header && subentry_keys ) {
      // Options that are grouped under a common header.
      const subentryOptions = subentry_keys
        .map((key) => ({
          val: key,
          text: patentMap[key].replace(/ patents/i, ''),
        }))
        .sort((a, b) => a.text.localeCompare(b.text, 'en', { sensitivity: 'base' }));

      return [
        { header },
        ...subentryOptions,
      ]
    } else {
      console.warn("Warning: shape of patent dropdown category entry does not match expectations and has been skipped:", entry);
      return [];
    }
  });

const DetailViewPatents = ({
  data,
}) => {
  const [aiSubfield, setAiSubfield] = useState("ai_patents");

  const yearSpanNdash = <>{overall.years[startIx]}&ndash;{overall.years[endIx]}</>;
  // const yearSpanAnd = <>{overall.years[startIx]} and {overall.years[endIx]}</>;

  const aiPatents = data.patents.ai_patents.total;
  const totalPatents = data.patents.all_patents.total;
  const aiPatentPercent = totalPatents ? Math.round( aiPatents / totalPatents * 1000) / 10 : "N/A";
  const aiPatentGrowth = commas(data.patents.ai_patents_growth.total, { maximumFractionDigits: 1 });

  const statGridEntries = [
    {
      key: "ai-patents",
      stat: <>#{commas(data.patents.ai_patents.rank)}</>,
      text: <>in PARAT for number of AI-related patents filed</>,
    },
    {
      key: "ai-patent-growth",
      stat: <>{aiPatentGrowth ? aiPatentGrowth : "N/A"}{aiPatentGrowth && "%"}</>,
      text: <>growth in {data.name}'s AI-related patent filing ({yearSpanNdash})</>,
    },
    {
      key: "ai-patent-grants",
      stat: <>{commas(data.patents.ai_patents_grants.total)}</>,
      text: <div>AI-related patents were <strong>granted</strong> to {data.name} ({yearSpanNdash})</div>,
    },
    {
      key: "ai-focused-percent",
      stat: <>{aiPatentPercent}{totalPatents > 0 && "%"}</>,
      text: <>of {data.name}'s total patents filed were AI-related</>,
    },
  ];

  const patentTableColumns = [
    { display_name: "Subfield", key: "subfield" },
    { display_name: "Patent applications", key: "patents" },
    { display_name: <>Growth ({overall.startPatentYear}&ndash;{overall.endPatentYear})</>, key: "growth" },
  ];

  const patentSubkeys = Object.keys(data.patents);

  const patentApplicationAreas = patentSubkeys
    .filter(key => data.patents[key].table === "application")
    .map((key) => {
      return {
        subfield: patentMap[key],
        patents: data.patents[key].total,
        growth: data.patents[key].growth ? data.patents[key].growth : "N/A",
      };
    })
    .sort((a, b) => b.patents - a.patents);

  const patentIndustryAreas = patentSubkeys
    .filter(key => data.patents[key].table === "industry")
    .map((key) => {
      return {
        subfield: patentMap[key],
        patents: data.patents[key].total,
        growth: data.patents[key].growth ? data.patents[key].growth : "N/A",
      };
    })
    .sort((a, b) => b.patents - a.patents);

  return (
    <>
      <HeaderWithLink title="Patents" />

      <TextAndBigStat
        smallText={<>Between {overall.years[0]} and {overall.years[overall.years.length-1]}, {data.name} filed</>}
        bigText={<>{commas(data.patents.ai_patents.total)} AI-related patents</>}
      />

      <StatGrid entries={statGridEntries} />

      <TableSection
        columns={patentTableColumns}
        css={styles.section}
        data={patentApplicationAreas}
        id="top-patent-applications"
        title={<>Top application areas across {data.name}'s AI filed patents</>}
      />

      <TableSection
        columns={patentTableColumns}
        css={styles.section}
        data={patentIndustryAreas}
        id="top-patent-industries"
        title={<>Top industry areas across {data.name}'s AI filed patents</>}
      />

      <TrendsChart
        css={styles.section}
        data={[
          [
            `${PATENT_DROPDOWN_OPTIONS.find(e => e.val === aiSubfield)?.text} patents at ${data.name}`,
            data.patents[aiSubfield].counts
          ],
          data.groups.sp500 && [
            "S&P 500 (average)",
            overall.groups.sp500.patents[aiSubfield].counts
          ],
          data.groups.globalBigTech && [
            "Global Big Tech (average)",
            overall.groups.globalBigTech.patents[aiSubfield].counts
          ],
        ]}
        id="ai-subfield-patents"
        layoutChanges={chartLayoutChanges}
        partialStartIndex={endIx}
        title={
          <>
            Trends in {data.name}'s patenting in
            <Dropdown
              css={styles.trendsDropdown}
              inputLabel="patent subfield"
              options={PATENT_DROPDOWN_OPTIONS}
              selected={aiSubfield}
              setSelected={setAiSubfield}
              showLabel={false}
            />
          </>
        }
        years={overall.years}
      />
    </>
  );
};

export default DetailViewPatents;
