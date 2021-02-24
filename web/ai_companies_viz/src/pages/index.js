import { Bar } from "react-chartjs-2";
import React from "react";
import pageStyles from "./styles";

const IndexPage = () => {
  const data = {
    labels: ["A", "B", "C"],
    datasets: [
      {
        label: "The Awesome Graph",
        backgroundColor: ["rgba(255,99,132,0.2)", "rgba(155,99,132,0.2)", "rgba(55,99,132,0.2)"],
        borderColor: ["rgba(255,99,132,1)", "rgba(155,99,132,1)", "rgba(55,99,132,1)"],
        borderWidth: 1,
        hoverBackgroundColor: ["rgba(255,99,132,0.4)", "rgba(155,99,132,0.4)", "rgba(55,99,132,0.4)"],
        hoverBorderColor: ["rgba(255,99,132,1)", "rgba(155,99,132,1)", "rgba(55,99,132,1)"],
        data: [65, 59, 80]
      }
    ]
};
  const options = {
    scales: {
        yAxes: [{
            display: true,
            ticks: {
                suggestedMin: 0
            }
        }]
    }
};
  return (
    <main style={pageStyles}>
      Hello world. This is a graph.
      <Bar data={data} options={options}/>
    </main>
  )
};

export default IndexPage
