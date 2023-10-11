import React, { useState } from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

import HeaderWithLink from './HeaderWithLink';
import StatGrid from './StatGrid';
import TableSection from './TableSection';
import TextAndBigStat from './TextAndBigStat';
import TrendsChart from './TrendsChart';
import { commas } from '../util';
import { assemblePlotlyParams } from '../util/plotly-helpers';

const styles = {
  section: css`
    margin: 2rem auto 1rem;
    max-width: 808px;

    h3 {
      margin-bottom: 0.5rem;
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

const DetailViewPatents = ({
  data,
}) => {
  const [aiSubfield, setAiSubfield] = useState("ai_patents");

  const statGridEntries = [
    {
      stat: <>#{commas(data.patents.ai_patents.rank)}</>,
      text: <>in PARAT for number of AI-related patents</>,
    },
    {
      stat: <>NUM%</>,
      text: <>growth in {data.name}'s AI patenting (YEAR-YEAR)</>,
    },
    {
      stat: <>NUM</>,
      text: <div>AI patent <strong>applications</strong> were filed by {data.name} (YEAR_YEAR)</div>,
    },
    {
      stat: <>NUM%</>,
      text: <>of {data.name}'s total patenting was AI-focused</>,
    },
  ];

  const numYears = data.years.length;
  const startIx = numYears - 7;
  const endIx = numYears - 2;
  const patentTableColumns = [
    { display_name: "Subfield", key: "subfield" },
    { display_name: "Patents granted", key: "patents" },
    { display_name: <>Growth ({data.years[startIx]}&ndash;{data.years[endIx]})</>, key: "growth" },
  ];

  const patentSubkeys = Object.keys(data.patents);

  // NOTE: for the time being, I'm hardcoding these to get data to display.  The
  // final implementation will require discussion and coordination.
  const patentApplicationAreas = patentSubkeys.slice(0, 5).map((key) => {
    const startVal = data.patents[key].counts[startIx];
    const endVal = data.patents[key].counts[endIx];
    const growth = `${Math.round((endVal - startVal) / startVal * 1000) / 10}%`;
    return {
      subfield: data.patents[key].name,
      patents: data.patents[key].total,
      growth,
    };
  });

  const patentIndustryAreas = patentSubkeys.slice(5, 10).map((key) => {
    const startVal = data.patents[key].counts[startIx];
    const endVal = data.patents[key].counts[endIx];
    const growth = `${Math.round((endVal - startVal) / startVal * 1000) / 10}%`;
    return {
      subfield: data.patents[key].name,
      patents: data.patents[key].total,
      growth,
    };
  });

  const aiSubfieldOptions = [
    { text: "AI (all subtopics)", val: "ai_patents" },
    // NOTE: Disable the other subtopics for now since the keys aren't in the data.
    // { text: "Computer vision", val: "cv_patents" },
    // { text: "Natural language processing", val: "nlp_patents" },
    // { text: "Robotics", val: "robotics_patents" },
  ];

  const aiSubfieldChartData = assemblePlotlyParams(
    "Trends in research....",
    data.years,
    [
      [
        aiSubfieldOptions.find(e => e.val === aiSubfield)?.text,
        data.patents[aiSubfield].counts
      ],
    ],
    chartLayoutChanges,
  );

  return (
    <>
      <HeaderWithLink title="Patents" />

      <TextAndBigStat
        smallText={<>Between {data.years[0]} and {data.years[data.years.length-1]}, {data.name} obtained</>}
        bigText={<>{commas(data.patents.ai_patents.total)} AI patents</>}
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
        {...aiSubfieldChartData}
        id="ai-subfield-patents"
        title={
          <>
            Trends in {data.name}'s patenting in
            <Dropdown
              inputLabel="patent subfield"
              options={aiSubfieldOptions}
              selected={aiSubfield}
              setSelected={setAiSubfield}
              showLabel={false}
            />
          </>
        }
      />
    </>
  );
};

export default DetailViewPatents;
