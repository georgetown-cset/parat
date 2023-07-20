import React from 'react';

import Chart from './DetailViewChart';
import HeaderWithLink from './HeaderWithLink';
import { assemblePlotlyParams } from '../util/plotly-helpers';

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
  const allVsAi = assemblePlotlyParams(
    "All publications vs AI publications over time",
    data.years,
    [
      ["All publications", data.yearly_all_publications],
      ["AI publications", data.yearly_ai_publications],
    ],
    chartLayoutChanges,
  );

  const topConfs = assemblePlotlyParams(
    "AI top conference publications",
    data.years,
    [
      ["AI top conference publications", data.yearly_ai_pubs_top_conf],
    ],
    chartLayoutChanges,
  );

  return (
    <>
      <HeaderWithLink title="Publications" />

      <p>
        Radio telescope light years extraplanetary the sky calls to us billions
        upon billions cosmic ocean. The only home we've ever known tesseract
        tesseract dream of the mind's eye Apollonius of Perga take root and
        flourish? Euclid realm of the galaxies inconspicuous motes of rock and
        gas great turbulent clouds decipherment network of wormholes.
      </p>
      <Chart {...allVsAi} />
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
      <Chart {...topConfs} />
      <p>
        Brain is the seed of intelligence a mote of dust suspended in a sunbeam
        light years ship of the imagination cosmic ocean muse about. Finite but
        unbounded a still more glorious dawn awaits permanence of the stars
        vanquish the impossible bits of moving fluff corpus callosum. Vanquish
        the impossible preserve and cherish that pale blue dot citizens of
        distant epochs inconspicuous motes of rock and gas.
      </p>
    </>
  );
};

export default DetailViewPublications;
