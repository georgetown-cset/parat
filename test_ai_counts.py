import unittest
from get_ai_counts import CountGetter
import warnings


def ignore_warnings(test_func):
    def do_test(self, *args, **kwargs):
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            test_func(self, *args, **kwargs)
    return do_test


class TestAICounts(unittest.TestCase):

    def test_init(self):
        count_getter = CountGetter("test.jsonl")
        self.assertEqual(count_getter.output_file, "test.jsonl")
        self.assertEqual(count_getter.regex_dict, {})

    def test_get_regex(self):
        count_getter = CountGetter("test.jsonl")
        count_getter.get_regex()
        # the dicts are populated
        self.assertGreater(len(count_getter.regex_dict), 0)
        # the values in the dict are the correct type
        for key_val in count_getter.regex_dict.keys():
            self.assertEqual(type(key_val), int)
            # we allow multiple regexes, so we have a list
            self.assertEqual(type(count_getter.regex_dict[key_val]), list)

    @ignore_warnings
    def test_run_query_papers(self):
        count_getter = CountGetter("test.jsonl")
        count_getter.get_regex()
        table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
        test = True
        companies = count_getter.run_query_papers(table_name, "ai_pubs", test=test, by_year=False)
        # Make sure we're setting the AI pubs for every company!
        for company in companies:
            self.assertIsNotNone(company["ai_pubs"])

    @ignore_warnings
    def test_run_query_papers_by_year(self):
        count_getter = CountGetter("test.jsonl")
        count_getter.get_regex()
        table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
        test = True
        companies = count_getter.run_query_papers(table_name, "ai_pubs", test=test, by_year=True)
        # Make sure we're setting the AI pubs for every company!
        for company in companies:
            self.assertIsNotNone(company["ai_pubs"])
            self.assertIsNotNone(company["ai_pubs_by_year"])

    @ignore_warnings
    def test_run_query_patents(self):
        count_getter = CountGetter("test.jsonl")
        count_getter.get_regex()
        table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
        test = True
        companies = count_getter.run_query_papers(table_name, "ai_pubs", test)
        companies = count_getter.run_query_patents(companies)
        for company in companies:
            self.assertIsNotNone(company["ai_patents"])




if __name__ == '__main__':
    unittest.main()
