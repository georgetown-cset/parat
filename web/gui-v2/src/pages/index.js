import React from 'react';
import { css } from '@emotion/react';
import { DateTime } from 'luxon';
import { graphql, useStaticQuery } from 'gatsby';

import { AppWrapper, InfoCard, breakpoints } from '@eto/eto-ui-components';

import ListView from '../components/ListView';

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
    margin: 35px 15px;

    ${breakpoints.tablet_regular} {
      margin: 50px 65px;
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
          PARAT collects data related to companies' artificial intelligence research and
          development in order to inform analyses of the global AI sector. This tracker
          includes companies with various degrees of AI activity that CSET has considered
          relevant to research at the intersection of AI and national security.
        </>}
        documentationLink="https://eto.tech/tool-docs/parat/"
        headingComponent="h1"
        title="ETO Private-sector AI-Related Activity Tracker"
      >
        <div css={styles.lastUpdated}>
          Site last updated <span className="no-percy">{data.site.buildTime}</span>
        </div>
      </InfoCard>
      <ListView css={styles.listView} />
    </AppWrapper>
  );
}

export default IndexPage;

export const Head = () => <title>PARAT &ndash; Emerging Technology Observatory</title>;
