import merge from 'lodash/merge';
import { PlotlyDefaults } from '@eto/eto-ui-components';


const assembleChartData = (name, years, vals, otherParams, options={}) => {
  const { partialStartIndex } = options;

  const common = {
    hovertemplate: "%{y}",
    legendgroup: name,
    mode: "lines+markers",
    name,
    type: "scatter",
  }

  // TODO / QUESTION: How do we want to handle the line/shading style for the
  // year specified in `year*End`?  Think about and adjust if desired.
  const endSolidIx = partialStartIndex ? (partialStartIndex + 1) : undefined;

  const result = [
    {
      ...common,
      ...otherParams,
      x: years.slice(0, endSolidIx),
      y: vals.slice(0, endSolidIx),
    }
  ];

  if ( partialStartIndex !== undefined ) {
    result.push({
      ...common,
      ...otherParams,
      fill: "tozeroy",
      line: { dash: "dash" },
      marker: { color: "lightgray" },
      showlegend: false,
      x: years.slice(partialStartIndex),
      y: vals.slice(partialStartIndex),
    });
  }

  return result;
};

/**
 * Generate the parameters for a given Plotly chart.
 *
 * @param {Array<number>} years Array of years corresponding to `data`
 * @param {Array<[string, Array<number>]>} data Array of tuples representing
 *     individual traces in the chart, each consisting of a string for the trace
 *     title and an array of values (which must be the same length as `years`).
 * @param {object} layoutChanges Any changes that should be merged into the
 *     ETO-standard `layout` object provided by `PlotlyDefaults`.
 * @param {object} options
 * @param {number} options.partialStartIndex
 * @returns {object} An object containing the parameters for this Plotly chart:
 *     `{ config, data, layout }`
 */
export const assemblePlotlyParams = (
  years,
  data,
  layoutChanges={},
  options={},
) => {
  const preparedData = data.flatMap(([traceTitle, traceData, otherParams={}]) => {
    return assembleChartData(traceTitle, years, traceData, otherParams, options);
  });
  const maxY = Math.max(
    ...data.map(e => Math.max(...e[1]))
  );
  const { config, layout } = PlotlyDefaults(maxY);
  merge(layout, layoutChanges);

  return {
    config,
    data: preparedData,
    layout,
  };
};
