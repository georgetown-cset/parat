import os
import sys
import unittest

myPath = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, myPath + '/../scripts/')

from web.scripts.retrieve_data import *


class TestMkTabText(unittest.TestCase):
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
            {"market_key": "EX:T1", "link": "https://www.google.com/finance/quote/EX:T1"},
            {"market_key": "EX:T2", "link": "https://www.google.com/finance/quote/T2:EX"}
        ]
        self.assertEqual(clean_market(market_info, market_key_to_link), expected_output)
        self.assertEqual(clean_market([], market_key_to_link), [])

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

    def test_add_ranks(self):
        pass

    def test_add_supplemental_descriptions(self):
        pass

    def test_clean_country(self):
        pass

    def test_get_continent(self):
        pass

    def test_clean_company_name(self):
        pass

    def test_clean_aliases(self):
        pass

    def test_get_list_and_links(self):
        pass

    def test_clean_row(self):
        pass