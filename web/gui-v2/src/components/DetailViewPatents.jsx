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

const DetailViewPatents = ({
  data,
}) => {
  const patentsChart = assemblePlotlyParams(
    "AI patents over time",
    data.years,
    [
      ["AI patents", data.patents.ai_patents.counts],
    ],
    chartLayoutChanges,
  );


  return (
    <>
      <HeaderWithLink title="Patents" />

      <p>
        Radio telescope light years extraplanetary the sky calls to us billions
        upon billions cosmic ocean. The only home we've ever known tesseract
        tesseract dream of the mind's eye Apollonius of Perga take root and
        flourish? Euclid realm of the galaxies inconspicuous motes of rock and
        gas great turbulent clouds decipherment network of wormholes.
      </p>

      <Chart {...patentsChart} />

      {/* TODO: add chart of top AI patent areas */}
    </>
  );
};

export default DetailViewPatents;
