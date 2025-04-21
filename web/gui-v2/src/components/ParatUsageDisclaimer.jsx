import React from 'react';
import { css } from '@emotion/react';

import { ExternalLink } from '@eto/eto-ui-components';

const styles = {
  wrapper: css` 
    background-color: white;
    font-size: 90%;
    margin: auto;
    max-width: 800px;
    padding: 2rem;
    color: var(--grey-light);
    
    a {
      color: var(--grey-light) !important;
    }
  `,
};

const ParatUsageDisclaimer = () => {
  return (
    <div css={styles.wrapper}>
      The AI activity metrics in the <ExternalLink href="https://eto.tech/dataset-docs/private-sector-ai-indicators/">Private-Sector AI Indicators dataset</ExternalLink> are derived from data from <ExternalLink href="https://www.reveliolabs.com/">Revelio Labs</ExternalLink>, ETO's <ExternalLink href="https://eto.tech/dataset-docs/mac/">Merged Academic Corpus</ExternalLink>, and other  sources. Additional descriptive metadata in PARAT comes from the <ExternalLink href="https://data.crunchbase.com/v3.1/docs/open-data-map">Crunchbase Open Data Map</ExternalLink> (<ExternalLink href="https://crunchbase.com">powered by Crunchbase</ExternalLink>) and <ExternalLink href="https://permid.org/">PermID</ExternalLink>. Emerging technology topic classifications are based on work supported in part by the Alfred P. Sloan Foundation under Grant No. G-2023-22358. For details on our sourcing, methodology, and limitations, see the <ExternalLink href={"https://eto.tech/tool-docs/parat/"}>tool documentation</ExternalLink>.
    </div>
  );
};

export default ParatUsageDisclaimer;
