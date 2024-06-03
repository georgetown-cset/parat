import { slugifyCompanyName } from ".";

it("slugifies company names as expected", () => {
  expect(slugifyCompanyName("Microsoft")).toEqual("microsoft");
  expect(slugifyCompanyName("Alphabet (including Google)")).toEqual("alphabet-including-google");
  expect(slugifyCompanyName("China Mobile Communications")).toEqual("china-mobile-communications");
  expect(slugifyCompanyName("Ap Moller - Maersk A/S")).toEqual("ap-moller-maersk-as");
  expect(slugifyCompanyName("Stryker Corp.")).toEqual("stryker-corp");
  expect(slugifyCompanyName("Jd.Com")).toEqual("jdcom");
});
