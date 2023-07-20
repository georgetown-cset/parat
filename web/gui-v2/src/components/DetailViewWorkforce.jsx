import React from 'react';
import { css } from '@emotion/react';

import HeaderWithLink from './HeaderWithLink';
import StatBox from './StatBox';

const styles = {
  statWrapper: css`
    display: flex;
    justify-content: space-around;
    margin: 1rem auto;
    max-width: 720px;
  `,
};

const DetailViewWorkforce = () => {
  return (
    <>
      <HeaderWithLink title="Workforce" />

      <div css={styles.statWrapper}>
        <StatBox label="tt1 jobs" value="1536" />
        <StatBox label="AI jobs" value="3456" />
      </div>
      <p>
        The carbon in our apple pies circumnavigated venture worldlets Orion's
        sword network of wormholes. Permanence of the stars another world
        preserve and cherish that pale blue dot kindling the energy hidden in
        matter muse about vastness is bearable only through love. Hearts of the
        stars realm of the galaxies birth dispassionate extraterrestrial
        observer vastness is bearable only through love not a sunrise but a
        galaxyrise. Encyclopaedia galactica rich in heavy atoms made in the
        interiors of collapsing stars descended from astronomers the only home
        we've ever known.
      </p>
    </>
  );
};

export default DetailViewWorkforce;
