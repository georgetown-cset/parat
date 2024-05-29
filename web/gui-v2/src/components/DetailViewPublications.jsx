import React, { useState } from 'react';
import { css } from '@emotion/react';

import { Dropdown } from '@eto/eto-ui-components';

import HeaderWithLink from './HeaderWithLink';
import StatGrid from './StatGrid';
import TableSection from './TableSection';
import TextAndBigStat from './TextAndBigStat';
import TrendsChart from './TrendsChart';
import overall from '../static_data/overall_data.json';
import { articleMap } from '../static_data/table_columns';
import { commas } from '../util';

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

  const articleYearSpanNdash = <>{overall.startArticleYear}&ndash;{overall.endArticleYear}</>;
  const yearSpanAnd = <>{overall.years[0]} and {overall.years[overall.years.length-1]}</>;

  const aiResearchPercent = Math.round(1000 * data.articles.ai_publications.total / data.articles.all_publications.total) / 10;

  const aiPubsGrowthTotal = commas(data.articles.ai_publications_growth.total, { maximumFractionDigits: 1 });
  const aiPubsGrowthSign = (aiPubsGrowthTotal > 0) ? '+' : '';

  const statGridEntries = [
    {
      key: "ai-papers",
      stat: <>#{data.articles.ai_publications.rank}</>,
      text: <>in PARAT for number of AI research articles</>,
    },
    {
      key: "average-citations",
      stat: <>{commas(data.articles.ai_citations_per_article.total)}</>,
      text: <>citations per AI article on average (#{commas(data.articles.ai_citations_per_article.rank)} in PARAT{data.groups.sp500 && <>, #{commas(data.articles.ai_citations_per_article.sp500_rank)} in the S&P 500</>})</>,
    },
    {
      key: "highly-cited",
      stat: <>{commas(data.articles.highly_cited_ai_pubs.total)}</>,
      text: <>highly-cited articles (#{commas(data.articles.highly_cited_ai_pubs.rank)} in PARAT{data.groups.sp500 && <>, #{commas(data.articles.highly_cited_ai_pubs.sp500_rank)} in the S&P 500</>})</>,
    },
    {
      key: "ai-research-growth",
      stat: <>{aiPubsGrowthSign}{aiPubsGrowthTotal ? aiPubsGrowthTotal : "N/A"}{aiPubsGrowthTotal && "%"}</>,
      text: <>growth in {data.name}'s public AI research ({articleYearSpanNdash})</>,
    },
    {
      key: "ai-top-conf",
      stat: <>{commas(data.articles.ai_pubs_top_conf.total)}</>,
      text: <>articles at top AI conferences (#{data.articles.ai_pubs_top_conf.rank} in PARAT{data.groups.sp500 && <>, #{commas(data.articles.ai_pubs_top_conf.sp500_rank)} in the S&P 500</>})</>,
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
      return {
        subfield: articleMap[key],
        articles: val.total,
        citations: Math.round(val.citations_per_article*10)/10,
        growth: val.growth ? val.growth : "N/A",
      };
    });

  const aiSubfieldOptions = [
    { text: "AI (all subtopics)", val: "ai_publications" },
    { text: "Computer vision", val: "cv_publications" },
    { text: "Natural language processing", val: "nlp_publications" },
    { text: "Robotics", val: "robotics_publications" },
  ];

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
        data={[
          [
            `AI research at ${data.name}: ${aiSubfieldOptions.find(e => e.val === aiSubfield)?.text}`,
            data.articles[aiSubfield].counts
          ],
          data.groups.sp500 && [
            "S&P 500 (average)",
            overall.groups.sp500.articles[aiSubfield].counts
          ],
          data.groups.globalBigTech && [
            "Global Big Tech (average)",
            overall.groups.globalBigTech.articles[aiSubfield].counts
          ],
        ]}
        id="ai-subfield-research"
        layoutChanges={chartLayoutChanges}
        partialStartIndex={endIx}
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
        years={overall.years}
      />

      <TrendsChart
        css={styles.section}
        data={[
          [
            `AI top conference publications at ${data.name}`,
            data.articles.ai_pubs_top_conf.counts
          ],
          data.groups.sp500 && [
            "S&P 500 (average)",
            overall.groups.sp500.articles.ai_pubs_top_conf.counts
          ],
          data.groups.globalBigTech && [
            "Global Big Tech (average)",
            overall.groups.globalBigTech.articles.ai_pubs_top_conf.counts
          ],
        ]}
        id="ai-top-conference-pubs-2"
        layoutChanges={chartLayoutChanges}
        partialStartIndex={endIx}
        title={<>{data.name}'s top AI conference publications</>}
        years={overall.years}
      />
    </>
  );
};

export default DetailViewPublications;
