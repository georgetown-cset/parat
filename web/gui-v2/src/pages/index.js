import React from 'react';
import { css } from '@emotion/react';
import { graphql, useStaticQuery } from 'gatsby';

import {
  AppWrapper,
  InfoCard,
  breakpoints,
} from '@eto/eto-ui-components';

import ListView from '../components/ListView';
import MetaTagsWrapper from '../components/MetaTagsWrapper';
import ParatUsageDisclaimer from '../components/ParatUsageDisclaimer';

const styles = {
  introBox: css`
    margin-bottom: 0;

    ${breakpoints.tablet_regular} {
      margin-bottom: 0;
    }
  `,
  lastUpdated: css`
    color: var(--grey);
  `,
  listView: css`
    margin: 35px 15px 0;

    ${breakpoints.tablet_regular} {
      margin: 50px 65px 0;
    }
  `,
};

const IndexPage = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        buildTime(formatString: "MMMM DD, YYYY")
      }
    }
  `);

  return (
    <AppWrapper>
      <InfoCard
        css={styles.introBox}
        description={<>
          PARAT is ETO's hub for data on private-sector companies and their AI activities, bringing together diverse data on companies' AI research publications, patents, and hiring. Use PARAT to explore how hundreds of leading companies around the world are engaged in AI, from Big Tech titans and leading generative AI startups to the entire S&P 500.
        </>}
        documentationLink="https://eto.tech/tool-docs/parat/"
        headingComponent="h1"
        title="🦜 Private-sector AI-Related Activity Tracker"
      >
        <div css={styles.lastUpdated}>
          Site last updated <span className="no-percy">{data.site.buildTime}</span>
        </div>
      </InfoCard>
      <ListView css={styles.listView} />
      <ParatUsageDisclaimer/>
    </AppWrapper>
  );
}

export default IndexPage;

export const Head = () => {
  return (
    <MetaTagsWrapper />
  );
};
