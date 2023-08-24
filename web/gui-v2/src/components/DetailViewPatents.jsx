import React from 'react';

import Chart from './DetailViewChart';
import HeaderWithLink from './HeaderWithLink';
import { assemblePlotlyParams } from '../util/plotly-helpers';


const chartLayoutChanges = {
  legend: {
    groupclick: 'toggleitem',
    y: 1.32,
  },
  margin: { t: 0, r: 50, b: 50, l: 50, pad: 4 },
  yaxis: {
    rangemode: 'tozero',
  },
};

const PATENT_CHART_LEGEND_GROUPINGS = {
  ai_patents: 'col-1',
  Security__eg_cybersecurity: 'col-1',
  Education: 'col-1',
  Networks__eg_social_IOT_etc: 'col-1',
  Business: 'col-1',

  Military: 'col-2',
  Agricultural: 'col-2',
  Life_Sciences: 'col-2',
  Entertainment: 'col-2',
  Transportation: 'col-2',

  Semiconductors: 'col-3',
  Nanotechnology: 'col-3',
  Energy_Management: 'col-3',
  Banking_and_Finance: 'col-3',
  Telecommunications: 'col-3',

  Computing_in_Government: 'col-4',
  Industrial_and_Manufacturing: 'col-4',
  Physical_Sciences_and_Engineering: 'col-4',
  Document_Mgt_and_Publishing: 'col-4',
  Personal_Devices_and_Computing: 'col-4',
};

const DetailViewPatents = ({
  data,
}) => {
  const patentsData = Object.entries(PATENT_CHART_LEGEND_GROUPINGS)
    .map(([key, group]) => {
      const { name, counts } = data.patents[key];
      return [name.replace(/ patents/i, ''), counts, { legendgroup: group }];
    });

  const patentsChart = assemblePlotlyParams(
    "AI patents over time",
    data.years,
    patentsData,
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
    </>
  );
};

export default DetailViewPatents;
