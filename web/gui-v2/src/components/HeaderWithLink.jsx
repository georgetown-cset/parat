import React from 'react';
import { css } from '@emotion/react';
import { slug as slugger } from 'github-slugger';

import { breakpoints, HelpTooltip } from '@eto/eto-ui-components';

// import HeaderLinkIcon from '../images/HeaderLink.svg'

const styles = {
  header: css`
    background-color: var(--bright-blue-medium);
    color: white;
    margin-bottom: 1rem;
    margin-top: 2.5rem;
    padding: 0.5rem 1rem;

    ${breakpoints.phone_large} {
      padding: 0.5rem 1.5rem;
    }
  `,
  title: css`
    flex: 0 0 auto;
    margin: 0;
    scroll-margin-top: 70px;
  `,
  anchor: css`
    left: 0;
    padding-right: 4px;
    position: absolute;
    top: 0;
    transform: translateX(-100%);
  `,
};

const HeaderWithLink = ({
  className: appliedClassName,
  css: appliedCss,
  title,
  tooltip,
  topic,
}) => {
  const slug = slugger(title);

  return (
    <div className={appliedClassName} css={[styles.header, appliedCss]}>
      <h2 id={slug} css={styles.title}>
        <a css={styles.anchor} href={`#${slug}`} aria-label="sample permalink">
          {/* <HeaderLinkIcon /> */}
        </a>
        {title}
        {tooltip && <HelpTooltip text={tooltip} iconStyle={{verticalAlign: "middle"}} />}
      </h2>
    </div>
  );
}

export default HeaderWithLink;
