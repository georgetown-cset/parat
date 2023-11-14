
import {
  parseSlider,
  parseOther,
} from './list-filters';

describe("helper functions for list view filters", () => {
  it("slider filters are parsed as expected", () => {
    expect(parseSlider("0,100")).toEqual([0, 100]);
    expect(parseSlider("0,64")).toEqual([0, 64]);
    expect(parseSlider("-100,50")).toEqual([-100, 50]);
  });

  it("other filters are parsed as expected", () => {
    expect(parseOther("")).toEqual([]);
    expect(parseOther("example")).toEqual(["example"]);
    expect(parseOther("alpha,beta")).toEqual(["alpha", "beta"]);
  });
});

