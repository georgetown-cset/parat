import React, { useState } from 'react';
import { css } from '@emotion/react';

import {
  Dropdown,
  Table,
  breakpoints,
} from '@eto/eto-ui-components';

import Chart from './DetailViewChart';
import HeaderWithLink from './HeaderWithLink';
import SectionHeading from './SectionHeading';
import { commas } from '../util';
import { assemblePlotlyParams } from '../util/plotly-helpers';

const styles = {
  noTopMargin: css`
    margin-top: 0;
  `,
  sectionMargin: css`
    margin: 1rem auto;
    max-width: 808px;
  `,
  sectionWithHeading: css`
    margin-top: 2rem;
    h3 {
      margin-bottom: 0.25rem;
    }
  `,
  aiResearch: css`
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-top: 1rem;

    ${breakpoints.tablet_regular} {
      flex-direction: row;
    }

    big {
      font-family: GTZirkonRegular;
      font-size: 180%;
      margin-left: 0.5rem;
    }
  `,
  stats: css`
    display: grid;
    gap: 0.5rem;
    grid-template-columns: minmax(0, 400px);
    list-style: none;
    margin: 1rem auto;
    max-width: fit-content;
    padding: 0;

    ${breakpoints.tablet_regular} {
      grid-template-columns: repeat(2, minmax(0, 400px));
    }

    & > li {
      align-content: center;
      border: 1px solid var(--bright-blue-light);
      display: grid;
      gap: 0.5rem;
      grid-template-columns: 80px 1fr;
      max-width: 400px;
      padding: 0.5rem;

      & > div {
        align-items: center;
        display: flex;

        &:first-of-type {
          font-size: 150%;
          justify-content: right;
        }
      }
    }
  `,
  topResearchTopics: css`
    margin: 1rem auto;
    max-width: 808px;
  `,
  topResearchTopicsTable: css`
    max-width: 808px;
  `,
  aiSubfieldChart: css`
    h3 {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin: 0 auto;
      width: fit-content;

      .dropdown .MuiFormControl-root {
        margin: 0;
        margin-left: 0.5rem;
      }
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

      <div css={[styles.aiResearch]}>
        Between {data.years[0]} and {data.years[data.years.length-1]}, {data.name} researchers released
        <big>{data.articles.ai_publications.total} AI research articles</big>
      </div>

      <ul css={[styles.sectionMargin, styles.stats]}>
        <li>
          <div>#{data.articles.ai_publications.rank}</div>
          <div>in PARAT for number of AI research articles</div>
        </li>
        <li>
          <div>{averageCitations}</div>
          <div>citations per article on average (#RANK in PARAT, #RANK in the S&P 500)</div>
        </li>
        <li>
          <div>NUMBER</div>
          <div>highly-cited articles (#RANK in PARAT, #RANK in the S&P 500)</div>
        </li>
        <li>
          <div>NUM%</div>
          <div>growth in {data.name}'s public AI research (YEAR-YEAR)</div>
        </li>
        <li>
          <div>{commas(data.articles.ai_pubs_top_conf.total)}</div>
          <div>articles at top AI conferences (#{data.articles.ai_pubs_top_conf.rank} in PARAT, #RANK in the S&P 500)</div>
        </li>
        <li>
          <div>NUM%</div>
          <div>of {data.name}'s total public research was AI-focused</div>
        </li>
      </ul>

      <div css={[styles.sectionMargin, styles.sectionWithHeading, styles.topResearchTopics]}>
        <SectionHeading id="top-research-topics">
          {data.name}'s top AI research topics
        </SectionHeading>
        <Table
          columns={topAiResearchTopicsColumns}
          css={styles.topResearchTopicsTable}
          data={topAiResearchTopics}
        />
      </div>

      <div css={[styles.sectionMargin, styles.sectionWithHeading, styles.aiSubfieldChart]}>
        <Chart
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
      </div>

      <div css={[styles.sectionMargin, styles.sectionWithHeading]}>
        <Chart {...topConfs} id="ai-top-conference-pubs" />
      </div>
    </>
  );
};

export default DetailViewPublications;
