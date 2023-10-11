import React, { useState } from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

import Chart from './DetailViewChart';
import HeaderWithLink from './HeaderWithLink';
import StatGrid from './StatGrid';
import TableSection from './TableSection';
import TextAndBigStat from './TextAndBigStat';
import TrendsChart from './TrendsChart';
import { commas } from '../util';
import { assemblePlotlyParams } from '../util/plotly-helpers';

const styles = {
  noTopMargin: css`
    margin-top: 0;
  `,
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
    y: 1.15,
  },
  margin: { t: 0, r: 50, b: 50, l: 50, pad: 4 },
  yaxis: {
    rangemode: 'tozero',
  },
};

const DetailViewPublications = ({
  data,
}) => {
  const [aiSubfield, setAiSubfield] = useState("ai_publications");

  const averageCitations = Math.round(10 * data.articles.citation_counts.total / data.articles.all_publications.total) / 10;

  const statGridEntries = [
    {
      stat: <>#{data.articles.ai_publications.rank}</>,
      text: <>in PARAT for number of AI research articles</>,
    },
    {
      stat: <>{averageCitations}</>,
      text: <>citations per article on average (#RANK in PARAT, #RANK in the S&P 500)</>,
    },
    {
      stat: <>NUMBER</>,
      text: <>highly-cited articles (#RANK in PARAT, #RANK in the S&P 500)</>,
    },
    {
      stat: <>NUM%</>,
      text: <>growth in {data.name}'s public AI research (YEAR-YEAR)</>,
    },
    {
      stat: <>{commas(data.articles.ai_pubs_top_conf.total)}</>,
      text: <>articles at top AI conferences (#{data.articles.ai_pubs_top_conf.rank} in PARAT, #RANK in the S&P 500)</>,
    },
    {
      stat: <>NUM%</>,
      text: <>of {data.name}'s total public research was AI-focused</>,
    },
  ];

  const topAiResearchTopicsColumns = [
    { display_name: "Subfield", key: "subfield" },
    { display_name: "Articles", key: "articles" },
    { display_name: "Citations per article", key: "citations" },
    { display_name: <>Growth (YEAR&ndash;YEAR)</>, key: "growth" },
  ];
  const topAiResearchTopics = [
    {
      subfield: "Computer vision",
      articles: data.articles.cv_pubs.total,
      citations: "???",
      growth: "???",
    },
    {
      subfield: "Natural language processing",
      articles: data.articles.nlp_pubs.total,
      citations: "???",
      growth: "???",
    },
    {
      subfield: "Robotics",
      articles: data.articles.robotics_pubs.total,
      citations: "???",
      growth: "???",
    },
  ];

  const aiSubfieldOptions = [
    { text: "AI (all subtopics)", val: "ai_publications" },
    { text: "Computer vision", val: "cv_pubs" },
    { text: "Natural language processing", val: "nlp_pubs" },
    { text: "Robotics", val: "robotics_pubs" },
  ];

  const aiSubfieldChartData = assemblePlotlyParams(
    "Trends in research....",
    data.years,
    [
      [
        aiSubfieldOptions.find(e => e.val === aiSubfield)?.text,
        data.articles[aiSubfield].counts
      ],
    ],
    chartLayoutChanges,
  );

  const topConfs = assemblePlotlyParams(
    <>{data.name}'s top AI conference publications</>,
    data.years,
    [
      ["AI top conference publications", data.articles.ai_pubs_top_conf.counts],
    ],
    chartLayoutChanges,
  );

  return (
    <>
      <HeaderWithLink css={styles.noTopMargin} title="Publications" />

      <TextAndBigStat
        smallText={<>Between {data.years[0]} and {data.years[data.years.length-1]}, {data.name} researchers released</>}
        bigText={<>{commas(data.articles.ai_publications.total)} AI research articles</>}
      />

      <StatGrid css={styles.sectionMargin} entries={statGridEntries} />

      <TableSection
        columns={topAiResearchTopicsColumns}
        css={styles.section}
        data={topAiResearchTopics}
        id="top-research-topics"
        title={<>{data.name}'s top AI research topics</>}
      />

      <TrendsChart
        css={styles.section}
        {...aiSubfieldChartData}
        id="ai-subfield-research"
        title={
          <>
            Trends in {data.name}'s research in
            <Dropdown
              inputLabel="AI subfield"
              options={aiSubfieldOptions}
              selected={aiSubfield}
              setSelected={setAiSubfield}
              showLabel={false}
            />
          </>
        }
      />

      <div css={styles.section}>
        <Chart {...topConfs} id="ai-top-conference-pubs" />
      </div>
    </>
  );
};

export default DetailViewPublications;
