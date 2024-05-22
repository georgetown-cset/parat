import merge from 'lodash/merge';
import { PlotlyDefaults } from '@eto/eto-ui-components';

export const CHART_COLORS = {
  COMPANY: "rgb(31, 119, 180)",
  SP500: "rgb(44, 160, 44)",
  GLOBAL500: "rgb(148, 103, 189)",
};

const GROUP_COLOR_MAP = {
  "S&P 500 (average)": CHART_COLORS.SP500,
  "Fortune Global 500 (average)": CHART_COLORS.GLOBAL500,
};

const assembleChartData = (name, years, vals, otherParams, options={}) => {
  const { partialStartIndex, color = "auto" } = options;

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
      line: { color },
      x: years.slice(0, endSolidIx),
      y: vals.slice(0, endSolidIx),
      _isBackground: false,
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
      _isBackground: true,
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
  const preparedData = data
    .flatMap(([traceTitle, traceData, otherParams={}], index) => {
      // Use consistent colors for groups, and blue for the company in question.
      // After that, let Plotly choose its own colors.
      if ( Object.hasOwn(GROUP_COLOR_MAP, traceTitle) ) {
        options.color = GROUP_COLOR_MAP[traceTitle];
      } else if ( index === 0 ) {
        options.color = CHART_COLORS.COMPANY;
      }
      return assembleChartData(traceTitle, years, traceData, otherParams, options);
    })
    .sort((a, b) => {
      if ( a._isBackground && !b._isBackground ) {
        return -1;
      } else if ( !a._isBackground && b._isBackground ) {
        return 1;
      } else {
        return 0;
      }
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
