import { assemblePlotlyParams } from './plotly-helpers';


const TITLE = "AI top conference publications";
const YEARS = [ 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023 ];
const INPUT_DATA = [
  [ TITLE, [ 850, 928, 845, 843, 838, 1040, 1357, 1551, 1507, 461, 2 ] ],
];
const LAYOUT_CHANGES = {
  legend: { y: 1.15 },
  margin: { b: 50, l: 50, pad: 4, r: 50, t: 0 },
};
const PARTIAL_START = YEARS.findIndex(e => e === 2022);

describe("Plotly helpers", () => {
  it("create the parameters as expected", () => {

    const { config, data, layout } = assemblePlotlyParams(YEARS, INPUT_DATA, LAYOUT_CHANGES, { partialStartIndex: PARTIAL_START });

    expect(config).toEqual({
      displayModeBar: false,
      responsive: true,
    });
    expect(data).toEqual([
      {
        _isBackground: true,
        fill: "tozeroy",
        hovertemplate: "%{y}",
        legendgroup: TITLE,
        line: { dash: "dash" },
        marker: { color: "lightgray" },
        mode: "lines+markers",
        name: TITLE,
        showlegend: false,
        type: "scatter",
        x: [ 2022, 2023 ],
        y: [ 461, 2 ],
      },
      {
        _isBackground: false,
        hovertemplate: "%{y}",
        legendgroup: TITLE,
        line: { color: "rgb(31, 119, 180)" },
        mode: "lines+markers",
        name: TITLE,
        type: "scatter",
        x: [ 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022 ],
        y: [ 850, 928, 845, 843, 838, 1040, 1357, 1551, 1507, 461 ],
      },
    ]);
    expect(layout).toEqual({
      autosize: true,
      xaxis: {
        fixedrange: true,
      },
      yaxis: {
        fixedrange: true,
      },
      font: {
        family: "GTZirkonRegular, Arial"
      },
      legend: {
        orientation: "h",
        yanchor: "top",
        xanchor: "center",
        y: 1.15,
        x: 0.5
      },
      margin: { b: 50, l: 50, pad: 4, r: 50, t: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
    });
  });
});
