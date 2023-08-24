import merge from 'lodash/merge';
import { PlotlyDefaults } from '@eto/eto-ui-components';


const assembleChartData = (name, years, vals, otherParams) => {
  return {
    hovertemplate: "%{y}",
    mode: 'lines+markers',
    type: 'scatter',
    ...otherParams,
    name,
    x: years,
    y: vals,
  };
};

/**
 * Generate the parameters for a given Plotly chart.
 *
 * @param {string} title Overall title for the chart
 * @param {Array<number>} years Array of years corresponding to `data`
 * @param {Array<[string, Array<number>]>} data Array of tuples representing
 *     individual traces in the chart, each consisting of a string for the trace
 *     title and an array of values (which must be the same length as `years`).
 * @param {object} layoutChanges Any changes that should be merged into the
 *     ETO-standard `layout` object provided by `PlotlyDefaults`.
 * @returns {object} An object containing the parameters for this Plotly chart:
 *     `{ config, data, layout, title }`
 */
export const assemblePlotlyParams = (title, years, data, layoutChanges) => {
  const preparedData = data.map(([traceTitle, traceData, otherParams={}]) => {
    return assembleChartData(traceTitle, years, traceData, otherParams);
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
    title,
  };
};

