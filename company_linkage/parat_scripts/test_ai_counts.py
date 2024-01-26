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
        count_getter = CountGetter()
        self.assertEqual(count_getter.regex_dict, {})

    def test_get_identifiers(self):
        count_getter = CountGetter()
        count_getter.get_identifiers()
        # the dicts are populated
        self.assertGreater(len(count_getter.regex_dict), 0)
        self.assertGreater(len(count_getter.ror_dict), 0)
        self.assertGreater(len(count_getter.cset_ids), 0)
        self.assertEqual(type(count_getter.cset_ids), list)
        # the values in the dict are the correct type
        for key_val in count_getter.regex_dict.keys():
            self.assertEqual(type(key_val), int)
            # we allow multiple regexes, so we have a list
            self.assertEqual(type(count_getter.regex_dict[key_val]), list)
        for key_val in count_getter.ror_dict.keys():
            self.assertEqual(type(key_val), int)
            # we allow multiple regexes, so we have a list
            self.assertEqual(type(count_getter.ror_dict[key_val]), list)

    @ignore_warnings
    def test_run_query_papers(self):
        count_getter = CountGetter()
        count_getter.get_identifiers()
        table_name = "gcp-cset-projects.staging_ai_companies_visualization.ai_publications"
        test = True
        companies = count_getter.run_query_papers(table_name, "ai_pubs", test=test, by_year=False)
        # Make sure we're setting the AI pubs for every company!
        for company in companies:
            self.assertIsNotNone(company["ai_pubs"])

    """
    This is deprecated and can no longer be tested this because
    the by-year data  isn't necessarily in the visualization table.
    TODO: Find a new way to test
    """
    # @ignore_warnings
    # def test_run_query_papers_by_year(self):
    #     count_getter = CountGetter()
    #     count_getter.get_identifiers()
    #     table_name = "gcp-cset-projects.ai_companies_visualization.no_grid_ai_publications"
    #     test = True
    #     companies = count_getter.run_query_papers(table_name, "ai_pubs", test=test, by_year=True)
    #     # Make sure we're setting the AI pubs for every company!
    #     for company in companies:
    #         self.assertIsNotNone(company["ai_pubs"])
    #         self.assertIsNotNone(company["ai_pubs_by_year"])

    @ignore_warnings
    def test_run_query_id_papers(self):
        count_getter = CountGetter()
        count_getter.get_identifiers()
        table_name = "gcp-cset-projects.staging_ai_companies_visualization.ai_publications"
        test = True
        company_rows = count_getter.run_query_id_papers(table_name, test=test)
        for company_row in company_rows:
            self.assertIsNotNone(company_row["CSET_id"])
            self.assertEqual(type(company_row["CSET_id"]), int)
            self.assertIsNotNone(company_row["merged_id"])
            self.assertIsNotNone(company_row["year"])
            self.assertEqual(type(company_row["year"]), int)
            self.assertIsNotNone(company_row["cv"])
            self.assertIsNotNone(company_row["nlp"])
            self.assertIsNotNone(company_row["robotics"])

    @ignore_warnings
    def test_run_query_id_patents(self):
        count_getter = CountGetter()
        count_getter.get_identifiers()
        table_name = "gcp-cset-projects.staging_ai_companies_visualization.ai_publications"
        test = True
        ai = True
        # count_getter.run_query_id_papers(table_name, test)
        patent_companies = count_getter.run_query_id_patents("linked_ai_patents", ai, test)
        for company_row in patent_companies:
            self.assertIsNotNone(company_row["CSET_id"])
            self.assertEqual(type(company_row["CSET_id"]), int)
            self.assertIsNotNone(company_row["family_id"])
            self.assertIsNotNone(company_row["priority_year"])
            self.assertEqual(type(company_row["priority_year"]), int)
            self.assertIsNotNone(company_row["Life_Sciences"])
            self.assertIsNotNone(company_row["Language_Processing"])
            self.assertIsNotNone(company_row["Analytics_and_Algorithms"])
            self.assertEqual(type(company_row["Life_Sciences"]), bool)
            self.assertEqual(type(company_row["Language_Processing"]), bool)
            self.assertEqual(type(company_row["Analytics_and_Algorithms"]), bool)


if __name__ == '__main__':
    unittest.main()
