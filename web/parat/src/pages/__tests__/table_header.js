import React from "react"
import {render} from "@testing-library/react"
import CompanyTableHead from "../table_header"

test("Table Header defaults", () => {
  const maxSliderValue = 100;
  const table = document.createElement("table");
  const header = render(
    <CompanyTableHead
      order={{
        "ai_pubs": 1,
        "ai_pubs_in_top_conferences": 1,
        "ai_patents": 1
      }}
      onRequestSort={() => {}}
      onFilterRows={() => {}}
      filterValues={{
        "ai_pubs": [0, maxSliderValue],
        "ai_pubs_in_top_conferences": [0, maxSliderValue],
        "ai_patents": [0, maxSliderValue],
        "name": [],
        "country": [],
        "continent": [],
        "stage": []
      }}
      maxSliderValue={maxSliderValue}
      filteredFilters={{
        "name": null,
        "country": null,
        "continent": null,
        "stage": null
      }}
    />, {container: document.body.appendChild(table)}
  );
  expect(header).toMatchSnapshot();
});