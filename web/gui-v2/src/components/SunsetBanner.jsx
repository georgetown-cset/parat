import React from 'react';

import { Alert, ExternalLink } from '@eto/eto-ui-components';

const SunsetBanner = () => {
  return (
    <div style={{ backgroundColor: "var(--red-lighter)" }}>
      <div style={{ margin: "0.5rem auto", maxWidth: "810px" }}>
        <Alert>
          The Emerging Technology Observatory will be sunsetting PARAT effective
          May 11, 2026.  For more details and information on how you can continue
          to access underlying data, see our {
            <ExternalLink href="https://eto.tech/blog/saying-goodbye-to-orca-and-parat/"><strong>recent blog post</strong></ExternalLink>
          }.
        </Alert>
      </div>
    </div>
  );
};

export default SunsetBanner;
