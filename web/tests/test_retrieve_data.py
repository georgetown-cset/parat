import os
import sys
import unittest

myPath = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, myPath + '/../scripts/')

from web.scripts.retrieve_data import *


class TestMkTabText(unittest.TestCase):
    maxDiff = None
    DATA_DIR = os.path.join("tests", "test_data")

    def test_clean_parent(self):
        orig = [
            {"parent_name": "test1", "parent_acquisition": True},
            {"parent_name": "test2", "parent_acquisition": False}
        ]
        lowercase_to_orig_cname = {
            "test1": "Test1",
            "test2": "tEsT2"
        }
        self.assertEqual(clean_parent(orig, lowercase_to_orig_cname), "Test1 (Acquired), tEsT2")
        self.assertEqual(clean_parent([], lowercase_to_orig_cname), None)

    def test_clean_children(self):
        orig = [
            {"child_name": "test1"},
            {"child_name": "test2"}
        ]
        lowercase_to_orig_cname = {
            "test1": "Test1",
            "test2": "tEsT2"
        }
        self.assertEqual(clean_children(orig, lowercase_to_orig_cname), "Test1, tEsT2")
        self.assertEqual(clean_children([], lowercase_to_orig_cname), None)

    def test_clean_market(self):
        market_info = [
            {"exchange": "EX", "ticker": "T1"},
            {"exchange": "EX", "ticker": "T2"},
        ]
        market_key_to_link = {
            "EX:T1": "https://www.google.com/finance/quote/EX:T1",
            "EX:T2": "https://www.google.com/finance/quote/T2:EX"
        }
        expected_output = [
            {"text": "EX:T1", "url": "https://www.google.com/finance/quote/EX:T1"},
            {"text": "EX:T2", "url": "https://www.google.com/finance/quote/T2:EX"}
        ]
        self.assertEqual(clean_market(market_info, market_key_to_link), expected_output)
        self.assertEqual(clean_market([], market_key_to_link), [])

    def test_add_ranks(self):
        rows = [
            {"cset_id": 1,
             ARTICLE_METRICS: {"metric": {"total": 2}},
             PATENT_METRICS: {"a_patent_metric": {"total": 1}}},
            {"cset_id": 2,
             ARTICLE_METRICS: {"metric": {"total": 2**4}},
             PATENT_METRICS: {"another_patent_metric": {"total": 2}}},
            {"cset_id": 3,
             ARTICLE_METRICS: {"metric": {"total": 2**8}},
             PATENT_METRICS: {"another_patent_metric": {"total": 1}}},
        ]
        expected_rows = [
            {"cset_id": 2,
             ARTICLE_METRICS: {"metric": {"total": 2 ** 4, "rank": 2}},
             PATENT_METRICS: {"a_patent_metric": {"total": 0, "rank": 2},
                              "another_patent_metric": {"total": 2, "rank": 1}}},
            {"cset_id": 3,
             ARTICLE_METRICS: {"metric": {"total": 2 ** 8, "rank": 1}},
             PATENT_METRICS: {"a_patent_metric": {"total": 0, "rank": 2},
                              "another_patent_metric": {"total": 1, "rank": 2}}},
            {"cset_id": 1,
             ARTICLE_METRICS: {"metric": {"total": 2, "rank": 3}},
             PATENT_METRICS: {"a_patent_metric": {"total": 1, "rank": 1},
                              "another_patent_metric": {"total": 0, "rank": 3}}}
        ]
        add_ranks(rows)
        self.assertEqual(rows, expected_rows)

    def test_clean_wiki_description(self):
        desc = ("Walmart Inc. ( /ˈwɔːlmɑːrt/; formerly Wal-Mart Stores, Inc.) is an American multinational "
                "retail corporation that operates a chain of hypermarkets, discount department stores, and "
                "grocery stores from the United States, headquartered in Bentonville, Arkansas.[11] "
                "The company was founded by Sam Walton in 1962 and incorporated on October 31, 1969. "
                "It also owns and operates Sam's Club retail warehouses.[12][13] As of January 31, 2021, "
                "Walmart has 11,443 stores and clubs in 27 countries, operating under 56 different names.[2][3][14] "
                "The company operates under the name Walmart in the United States and Canada, as Walmart de México y "
                "Centroamérica in Mexico and Central America, as Asda in the United Kingdom, as the Seiyu Group in "
                "Japan, and as Flipkart Wholesale in India. It has wholly owned operations in Argentina, Chile, "
                "Canada, and South Africa. Since August 2018, Walmart holds only a minority stake in Walmart "
                "Brasil, which was renamed Grupo Big in August 2019, with 20 percent of the company's shares, "
                "and private equity firm Advent International holding 80 percent ownership of the company.")
        clean_desc = ("Walmart Inc. is an American multinational "
                "retail corporation that operates a chain of hypermarkets, discount department stores, and "
                "grocery stores from the United States, headquartered in Bentonville, Arkansas. "
                "The company was founded by Sam Walton in 1962 and incorporated on October 31, 1969. "
                "It also owns and operates Sam's Club retail warehouses. As of January 31, 2021, "
                "Walmart has 11,443 stores and clubs in 27 countries, operating under 56 different names. "
                "The company operates under the name Walmart in the United States and Canada, as Walmart de México y "
                "Centroamérica in Mexico and Central America, as Asda in the United Kingdom, as the Seiyu Group in "
                "Japan, and as Flipkart Wholesale in India. It has wholly owned operations in Argentina, Chile, "
                "Canada, and South Africa. Since August 2018, Walmart holds only a minority stake in Walmart "
                "Brasil, which was renamed Grupo Big in August 2019, with 20 percent of the company's shares, "
                "and private equity firm Advent International holding 80 percent ownership of the company.")
        self.assertEqual(clean_wiki_description(desc), clean_desc)

    def test_clean_country(self):
        self.assertEqual("South Korea", clean_country("kr"))
        self.assertEqual("United States", clean_country("usa"))
        self.assertEqual("Taiwan", clean_country("tw"))
        self.assertEqual("United States", clean_country("us"))

    def test_get_continent(self):
        self.assertEqual("Asia", get_continent("South Korea"))
        self.assertEqual("Asia", get_continent("Taiwan"))
        self.assertEqual("Oceania", get_continent("Australia"))
        self.assertEqual("Africa", get_continent("Ethiopia"))

    def test_clean_company_name(self):
        self.assertEqual(clean_company_name("captricity", {}), "Vidado")
        self.assertEqual(clean_company_name("创新奇智", {}), "AInnovation")
        self.assertEqual(clean_company_name("ibm", {"ibm": "IBM"}), "IBM")
        self.assertEqual(clean_company_name("test", {}), "Test")

    def test_clean_aliases(self):
        aliases = [{"alias": "foo"}, {"alias": "bar"}, {"alias": "baz"}]
        lowercase_to_orig_cname = {
            "foo": "FoO",
            "bar": "BAR",
        }
        self.assertEqual("BAR; Baz; FoO; Fred", clean_aliases(aliases, lowercase_to_orig_cname, "Fred"))

    def test_format_links(self):
        prefix = "https://my_test_prefix.com/"
        link_suffixes = ["foo", "bar", "baz"]
        expected_links = [{"text": "foo", "url": prefix+"foo"},
                          {"text": "bar", "url": prefix+"bar"},
                          {"text": "baz", "url": prefix+"baz"}]
        self.assertEqual(expected_links, format_links(link_suffixes, prefix))

    def test_get_yearly_counts(self):
        counts = [{"year": 2002, "count": 1}, {"year": 2021, "count": 2}, {"year": 2015, "count": 15}]
        years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
        expected_values = [0 for _ in years]
        expected_values[-2] = 2
        expected_values[0] = 15
        self.assertEqual(get_yearly_counts(counts, "count", years), (expected_values, 17))

    def test_alphabet(self):
        self.run_clean_row_test("alphabet")

    def test_hugging_face(self):
        self.run_clean_row_test("hugging_face")

    def run_clean_row_test(self, company):
        market_key_to_link = {}
        with open(EXCHANGE_LINK_FI) as f:
            for line in f:
                js = json.loads(line)
                market_key_to_link[js["market_key"].upper()] = js["link"]
        with open(os.path.join(self.DATA_DIR, f"{company}_input.json")) as f:
            input_data = f.read()
        with open(os.path.join(self.DATA_DIR, f"{company}_output.json")) as f:
            expected_output = json.load(f)
        output = clean_row(input_data, False, {}, market_key_to_link)
        if output["local_logo"] != expected_output["local_logo"]:
            # then we're probably running on github actions and the images are not available
            assert not output["local_logo"] and not os.path.exists(os.path.join(IMAGE_DIR, f"{company}.png"))
            output["local_logo"] = f"{company}.png"
        self.assertEqual(output, expected_output)

    def test_get_growth(self):
        self.assertEqual(16.984126984126984, get_growth([0, 1, 2, 1, 0, 5, 6, 7, 8, 9]))
        self.assertEqual(-40.0, get_growth([0, 1, 2, 1, 0, 5, 6, 7, 8, 9], is_patents=True))
