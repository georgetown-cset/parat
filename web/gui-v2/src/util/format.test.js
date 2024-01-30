import { formatActiveSliderFilter } from './format';

it("formats the active filter tooltips as expected", () => {
  expect(formatActiveSliderFilter([0, 72], [0, 100])).toEqual("No more than 72");
  expect(formatActiveSliderFilter([-32, 64], [-100, 100], true)).toEqual("Between -32% and 64%");
  expect(formatActiveSliderFilter([12, 100], [0, 100])).toEqual("12 or higher");
});
