import React from 'react';

import { MetaTags } from '@eto/social-cards';
import socialCard from '@eto/social-cards/dist/tools/parat.png';

const MetaTagsWrapper = ({
  title = "PARAT \u2013 Emerging Technology Observatory",
  subtitle = undefined,
  description = "ETO's tool to map high-level trends in global emerging technology research."
}) => {
  const fullTitle = subtitle ? `${subtitle} \u2013 ${title}` : title;

  return (
    <>
      <title>{fullTitle}</title>
      <MetaTags
        title={fullTitle}
        description={description}
        socialCardUrl={socialCard}
      />
    </>
  );
};

export default MetaTagsWrapper;
