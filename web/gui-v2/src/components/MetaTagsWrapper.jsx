import React from 'react';

import { MetaTags } from '@eto/social-cards';
import socialCard from '@eto/social-cards/dist/tools/parat.png';

const MetaTagsWrapper = ({
  title = "PARAT \u2013 Emerging Technology Observatory",
  subtitle = undefined,
  description = "ETO's hub for data on private-sector companies and their AI activities."
}) => {
  const fullTitle = subtitle ? `${subtitle} \u2013 ${title}` : title;

  return (
    <>
      <title>{fullTitle}</title>
      <MetaTags
        title={fullTitle}
        description={description}
        socialCardUrl={`https://parat.eto.tech${socialCard}`}
      />
    </>
  );
};

export default MetaTagsWrapper;
