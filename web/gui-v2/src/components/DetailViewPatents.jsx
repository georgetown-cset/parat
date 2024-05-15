import React, { useState } from 'react';
import { css } from '@emotion/react';

import { Autocomplete } from '@eto/eto-ui-components';

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
    .MuiAutocomplete-root .MuiInput-root.MuiInputBase-sizeSmall .MuiInput-input {
      padding: 4px;
      text-align: center;
    }

    ul > li {
      text-align: left;
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

const DetailViewPatents = ({
  data,
}) => {
  const [aiSubfield, setAiSubfield] = useState("ai_patents");

  const yearSpanNdash = <>{overall.years[startIx]}&ndash;{overall.years[endIx]}</>;
  // const yearSpanAnd = <>{overall.years[startIx]} and {overall.years[endIx]}</>;

  const aiPatentStart = data.patents.ai_patents.counts[startIx];
  const aiPatentEnd = data.patents.ai_patents.counts[endIx];
  const aiPatentGrowth = Math.round((aiPatentEnd - aiPatentStart) / aiPatentStart * 1000) / 10;
  const aiPatentPercent = Math.round(data.patents.ai_patents.total / data.patents.all_patents.total * 1000) / 10

  const statGridEntries = [
    {
      key: "ai-patents",
      stat: <>#{commas(data.patents.ai_patents.rank)}</>,
      text: <>in PARAT for number of AI-related patents</>,
    },
    {
      key: "ai-patent-growth",
      stat: <>{commas(data.patents.ai_patents_growth.total, { maximumFractionDigits: 1 })}%</>,
      text: <>growth in {data.name}'s AI-related patenting ({yearSpanNdash})</>,
    },
    {
      key: "ai-patent-grants",
      stat: <>{commas(data.patents.ai_patents_grants.total)}</>,
      text: <div>AI-related patents were <strong>granted</strong> to {data.name} ({yearSpanNdash})</div>,
    },
    {
      key: "ai-focused-percent",
      stat: <>{aiPatentPercent}%</>,
      text: <>of {data.name}'s total patenting was AI-related</>,
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
      const startVal = data.patents[key].counts[startIx];
      const endVal = data.patents[key].counts[endIx];
      const growth = `${Math.round((endVal - startVal) / startVal * 1000) / 10}%`;
      return {
        subfield: patentMap[key],
        patents: data.patents[key].total,
        growth,
      };
    })
    .sort((a, b) => b.patents - a.patents);

  const patentIndustryAreas = patentSubkeys
    .filter(key => data.patents[key].table === "industry")
    .map((key) => {
      const startVal = data.patents[key].counts[startIx];
      const endVal = data.patents[key].counts[endIx];
      const growth = `${Math.round((endVal - startVal) / startVal * 1000) / 10}%`;
      return {
        subfield: patentMap[key],
        patents: data.patents[key].total,
        growth,
      };
    })
    .sort((a, b) => b.patents - a.patents);

  const aiSubfieldOptions = patentSubkeys
    .filter(k => !!data.patents[k]?.counts)
    .map(k => ({ text: patentMap[k].replace(/ patents/i, ''), val: k }))
    .sort((a, b) => a.text.localeCompare(b.text, 'en', { sensitivity: 'base' }));

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
        title={<>Top application areas across {data.name}'s AI patents</>}
      />

      <TableSection
        columns={patentTableColumns}
        css={styles.section}
        data={patentIndustryAreas}
        id="top-patent-industries"
        title={<>Top industry areas across {data.name}'s AI patents</>}
      />

      <TrendsChart
        css={styles.section}
        data={[
          [
            `${aiSubfieldOptions.find(e => e.val === aiSubfield)?.text} patents at ${data.name}`,
            data.patents[aiSubfield].counts
          ],
          data.groups.sp500 && [
            "S&P 500 (average)",
            overall.groups.sp500.patents[aiSubfield].counts
          ],
          data.groups.global500 && [
            "Fortune Global 500 (average)",
            overall.groups.global500.patents[aiSubfield].counts
          ],
        ]}
        id="ai-subfield-patents"
        layoutChanges={chartLayoutChanges}
        partialStartIndex={endIx}
        title={
          <>
            Trends in {data.name}'s patenting in
            <Autocomplete
              css={styles.trendsDropdown}
              disableClearable={true}
              inputLabel="patent subfield"
              options={aiSubfieldOptions}
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
