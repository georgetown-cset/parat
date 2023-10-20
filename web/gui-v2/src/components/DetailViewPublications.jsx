import React, { useState } from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

import Chart from './DetailViewChart';
import HeaderWithLink from './HeaderWithLink';
import StatGrid from './StatGrid';
import TableSection from './TableSection';
import TextAndBigStat from './TextAndBigStat';
import TrendsChart from './TrendsChart';
import overall from '../static_data/overall_data.json';
import { articleMap } from '../static_data/table_columns';
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
    y: 1.15,
  },
  margin: { t: 0, r: 50, b: 50, l: 50, pad: 4 },
  yaxis: {
    rangemode: 'tozero',
  },
};

const startIx = overall.years.findIndex(e => e === overall.startArticleYear);
const endIx = overall.years.findIndex(e => e === overall.endArticleYear);

const DetailViewPublications = ({
  data,
}) => {
  const [aiSubfield, setAiSubfield] = useState("ai_publications");

  const yearSpanNdash = <>{overall.years[0]}&ndash;{overall.years[overall.years.length-1]}</>;
  const yearSpanAnd = <>{overall.years[0]} and {overall.years[overall.years.length-1]}</>;

  const averageCitations = Math.round(10 * data.articles.citation_counts.total / data.articles.all_publications.total) / 10;
  const aiResearchPercent = Math.round(1000 * data.articles.ai_publications.total / data.articles.all_publications.total) / 10;

  const statGridEntries = [
    {
      key: "ai-papers",
      stat: <>#{data.articles.ai_publications.rank}</>,
      text: <>in PARAT for number of AI research articles</>,
    },
    {
      key: "average-citations",
      stat: <>{averageCitations}</>,
      text: <>citations per article on average (#RANK in PARAT, #RANK in the S&P 500)</>,
    },
    {
      key: "highly-cited",
      stat: <>NUMBER</>,
      text: <>highly-cited articles (#RANK in PARAT, #RANK in the S&P 500)</>,
    },
    {
      key: "ai-research-growth",
      stat: <>NUM%</>,
      text: <>growth in {data.name}'s public AI research ({yearSpanNdash})</>,
    },
    {
      key: "ai-top-conf",
      stat: <>{commas(data.articles.ai_pubs_top_conf.total)}</>,
      text: <>articles at top AI conferences (#{data.articles.ai_pubs_top_conf.rank} in PARAT, #RANK in the S&P 500)</>,
    },
    {
      key: "ai-research-percent",
      stat: <>{aiResearchPercent}%</>,
      text: <>of {data.name}'s total public research was AI-focused</>,
    },
  ];

  const topAiResearchTopicsColumns = [
    { display_name: "Subfield", key: "subfield" },
    { display_name: "Articles", key: "articles" },
    { display_name: "Citations per article", key: "citations" },
    { display_name: <>Growth ({overall.startArticleYear}&ndash;{overall.endArticleYear})</>, key: "growth" },
  ];
  const topAiResearchTopics = Object.entries(data.articles)
    .filter(([_key, val]) => val.isTopResearch)
    .map(([key, val]) => {
      const startVal = val.counts[startIx];
      const endVal = val.counts[endIx];

      return {
        subfield: articleMap[key],
        articles: val.total,
        citations: "???",
        growth: `${Math.round((endVal - startVal) / startVal * 1000) / 10}%`,
      };
    });

  const aiSubfieldOptions = [
    { text: "AI (all subtopics)", val: "ai_publications" },
    { text: "Computer vision", val: "cv_pubs" },
    { text: "Natural language processing", val: "nlp_pubs" },
    { text: "Robotics", val: "robotics_pubs" },
  ];

  const aiSubfieldChartData = assemblePlotlyParams(
    "Trends in research....",
    overall.years,
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
    overall.years,
    [
      ["AI top conference publications", data.articles.ai_pubs_top_conf.counts],
    ],
    chartLayoutChanges,
  );

  return (
    <>
      <HeaderWithLink css={styles.noTopMargin} title="Publications" />

      <TextAndBigStat
        smallText={<>Between {yearSpanAnd}, {data.name} researchers released</>}
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
              css={styles.trendsDropdown}
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
