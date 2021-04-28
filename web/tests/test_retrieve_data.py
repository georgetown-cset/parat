import os
import sys
import unittest

myPath = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, myPath + '/../scripts/')

from web.scripts.retrieve_data import *


class TestMkTabText(unittest.TestCase):
    maxDiff = None

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
        rows = [{"metric": 2}, {"metric": 2**4}, {"metric": 2**8}]
        add_ranks(rows, ["metric"])
        self.assertEqual(rows, [{"metric": {"frac_of_max": 1.0, "rank": 1, "value": 256}},
                                {"metric": {"frac_of_max": 0.5105738866634614, "rank": 2, "value": 16}},
                                {"metric": {"frac_of_max": 0.1979811182727465, "rank": 3, "value": 2}}])

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

    def test_get_list_and_links(self):
        prefix = "https://my_test_prefix.com/"
        link_suffixes = ["foo", "bar", "baz"]
        template = f"<a class={LINK_CSS} target='blank' rel='noreferrer' href='{prefix}" + "{}'>{}</a>"
        expected_links = [template.format(link_text, link_text) for link_text in link_suffixes]
        self.assertEqual(get_list_and_links(link_suffixes, prefix),
                         (", ".join(link_suffixes), {"__html": ", ".join(expected_links)}))

    def test_get_yearly_counts(self):
        counts = [{"year": 2002, "count": 1}, {"year": 2021, "count": 2}, {"year": 2015, "count": 15}]
        years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
        expected_values = [0 for year in years]
        expected_values[-2] = 2
        expected_values[0] = 15
        self.assertEqual(get_yearly_counts(counts, "count", years), (expected_values, 17))

    def test_get_market_link_list(self):
        market_info = [{"link": "foo", "market_key": "BAR:FOO"}, {"market_key": "TEST:BAZ", "link": ""}]
        expected_outputs = f"<a class={LINK_CSS} target='blank' rel='noreferrer' href='foo'>BAR:FOO</a>, TEST:BAZ"
        self.assertEqual(get_market_link_list(market_info), {"__html": expected_outputs})

    def test_clean_row_alphabet(self):
        market_key_to_link = {}
        with open(EXCHANGE_LINK_FI) as f:
            for line in f:
                js = json.loads(line)
                market_key_to_link[js["market_key"].upper()] = js["link"]
        input = ('{"CSET_id": 796, "name": "alphabet", "country": "usa", '
                 '"aliases": [{"alias_language": "en", "alias": "alphabet inc"}], "parent": [], '
                 '"children": [{"child_name": "verily life sciences", "child_id": 745}, '
                 '{"child_name": "waymo", "child_id": 762}], "non_agg_children": '
                 '[{"child_name": "google", "child_id": 101}, {"child_name": "deepmind", "child_id": 414}, '
                 '{"child_name": "fitbit", "child_id": 451}, {"child_name": "google brain", "child_id": 473}, '
                 '{"child_name": "google robotics", "child_id": 474}], "permid": [5050702354, 5053732847, 5030853586], '
                 '"website": "https://abc.xyz/", "market": [{"exchange": "nasdaq", "ticker": "googl"}], '
                 '"crunchbase": {"crunchbase_uuid": "096694c6-bcd2-a975-b95c-fab77c81d915", '
                 '"crunchbase_url": "https://www.crunchbase.com/organization/alphabet?utm_source=crunchbase'
                 '&utm_medium=export&utm_campaign=odm_csv"}, "child_crunchbase": [{"crunchbase_uuid": '
                 '"ceff4e5b-95c2-839a-3150-c340c4b5bc71", "crunchbase_url": '
                 '"https://www.crunchbase.com/organization/verily-2"}, {"crunchbase_uuid": '
                 '"c1833ca6-85d5-e3b8-08e5-8fcceb76717b", "crunchbase_url": '
                 '"https://www.crunchbase.com/organization/google-s-self-driving-car-project"}], '
                 '"grid": ["grid.497059.6"], "ai_pubs": 2, "ai_pubs_by_year": [{"year": 2018, "ai_pubs": 1}, '
                 '{"year": 2019, "ai_pubs": 1}], "ai_patents": 0, "ai_patents_by_year": [], '
                 '"ai_pubs_in_top_conferences": 0, "ai_pubs_in_top_conferences_by_year": [], "all_pubs": 9, '
                 '"all_pubs_by_year": [{"year": 2016, "all_pubs": 1}, {"year": 2017, "all_pubs": 1}, {"year": 2018, '
                 '"all_pubs": 3}, {"year": 2019, "all_pubs": 4}], "short_description": "Alphabet is the holding '
                 'company of Google, Inc. and several Google-related initiatives.", "logo_url": '
                 '"https://crunchbase-production-res.cloudinary.com/image/upload/c_lpad,h_120,w_120,f_jpg/'
                 'v1439250525/oyr10rqwvctjcfxnvapx.png", "stage": "Mature"}')
        expected_output = {'CSET_id': 796,
            'agg_child_info': 'Verily Life Sciences, Waymo',
            'ai_patents': 0,
            'ai_pubs': 2,
            'ai_pubs_in_top_conferences': 0,
            'aliases': 'Alphabet Inc',
            'all_pubs': 9,
            'child_crunchbase': [{'crunchbase_url': 'https://www.crunchbase.com/organization/verily-2',
                                  'crunchbase_uuid': 'ceff4e5b-95c2-839a-3150-c340c4b5bc71'},
                                 {'crunchbase_url': 'https://www.crunchbase.com/organization/google-s-self-driving-car-project',
                                  'crunchbase_uuid': 'c1833ca6-85d5-e3b8-08e5-8fcceb76717b'}],
            'continent': 'North America',
            'country': 'United States',
            'crunchbase': {'crunchbase_url': 'https://www.crunchbase.com/organization/alphabet?utm_source=crunchbase&utm_medium=export&utm_campaign=odm_csv',
                           'crunchbase_uuid': '096694c6-bcd2-a975-b95c-fab77c81d915'},
            'crunchbase_description': 'Alphabet is the holding company of Google, Inc. '
                                      'and several Google-related initiatives.',
            'full_market_links': {'__html': "<a class='MuiTypography-root MuiLink-root "
                                            'MuiLink-underlineHover '
                                            "MuiTypography-colorPrimary' target='blank' "
                                            "rel='noreferrer' "
                                            "href='https://www.google.com/finance/quote/googl:nasdaq'>NASDAQ:GOOGL</a>"},
            'grid_info': 'grid.497059.6',
            'grid_links': {'__html': "<a class='MuiTypography-root MuiLink-root "
                                     "MuiLink-underlineHover MuiTypography-colorPrimary' "
                                     "target='blank' rel='noreferrer' "
                                     "href='https://www.grid.ac/institutes/grid.497059.6'>grid.497059.6</a>"},
            'local_logo': 'alphabet.png',
            'market_filt': [{'link': 'https://www.google.com/finance/quote/googl:nasdaq',
                             'market_key': 'NASDAQ:GOOGL'}],
            'market_list': 'NASDAQ:GOOGL',
            'name': 'Alphabet',
            'parent_info': None,
            'permid_info': '5050702354, 5053732847, 5030853586',
            'permid_links': {'__html': "<a class='MuiTypography-root MuiLink-root "
                                       'MuiLink-underlineHover '
                                       "MuiTypography-colorPrimary' target='blank' "
                                       "rel='noreferrer' "
                                       "href='https://permid.org/1-5050702354'>5050702354</a>, "
                                       "<a class='MuiTypography-root MuiLink-root "
                                       'MuiLink-underlineHover '
                                       "MuiTypography-colorPrimary' target='blank' "
                                       "rel='noreferrer' "
                                       "href='https://permid.org/1-5053732847'>5053732847</a>, "
                                       "<a class='MuiTypography-root MuiLink-root "
                                       'MuiLink-underlineHover '
                                       "MuiTypography-colorPrimary' target='blank' "
                                       "rel='noreferrer' "
                                       "href='https://permid.org/1-5030853586'>5030853586</a>"},
            'stage': 'Mature',
            'unagg_child_info': 'Google, Deepmind, Fitbit, Google Brain, Google Robotics',
            'website': 'https://abc.xyz/',
            'yearly_ai_patents': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            'yearly_ai_publications': [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
            'yearly_ai_pubs_top_conf': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            'yearly_all_publications': [0, 0, 0, 0, 0, 0, 1, 1, 3, 4, 0, 0],
            'years': [2010,
                      2011,
                      2012,
                      2013,
                      2014,
                      2015,
                      2016,
                      2017,
                      2018,
                      2019,
                      2020,
                      2021]}
        output = clean_row(input, False, {}, market_key_to_link)
        if output["local_logo"] != expected_output["local_logo"]:
            # then we're probably running on github actions and the images are not available
            assert not output["local_logo"] and not os.path.exists(os.path.join(IMAGE_DIR, "hugging_face.png"))
            output["local_logo"] = "alphabet.png"
        self.assertEqual(output, expected_output)

    def test_clean_row_hf(self):
        market_key_to_link = {}
        with open(EXCHANGE_LINK_FI) as f:
            for line in f:
                js = json.loads(line)
                market_key_to_link[js["market_key"].upper()] = js["link"]
        input = ('{"CSET_id": 1425, "name": "hugging face", "country": "us", "aliases": [{"alias_language": "en", '
                 '"alias": "hugging face, inc."}, {"alias_language": "en", "alias": "hugging face inc"}], "parent": [], '
                 '"children": [], "non_agg_children": [], "permid": [5063742076], "website": "https://huggingface.co/", '
                 '"market": [], "crunchbase": {"crunchbase_uuid": "b7947f18-b199-45ac-b7da-66f5c52fcfbc", '
                 '"crunchbase_url": "https://www.crunchbase.com/organization/hugging-face"}, "child_crunchbase": [], '
                 '"grid": [], "ai_pubs": 2, "ai_pubs_by_year": [{"year": 2018, "ai_pubs": 2}], "ai_patents": 0, '
                 '"ai_patents_by_year": [], "ai_pubs_in_top_conferences": 0, "ai_pubs_in_top_conferences_by_year": [], '
                 '"all_pubs": 2, "all_pubs_by_year": [{"year": 2018, "all_pubs": 2}], "short_description": '
                 '"Hugging Face is building open-source tools for natural language processing", "logo_url": '
                 '"https://crunchbase-production-res.cloudinary.com/image/upload/c_lpad,h_120,w_120,f_jpg/v1505375959'
                 '/urhmulzddqdfmlzpk2vn.png", "stage": "Growth"}')
        expected_output = {'CSET_id': 1425,
                 'agg_child_info': None,
                 'ai_patents': 0,
                 'ai_pubs': 2,
                 'ai_pubs_in_top_conferences': 0,
                 'aliases': 'Hugging Face Inc; Hugging Face, Inc',
                 'all_pubs': 2,
                 'child_crunchbase': [],
                 'continent': 'North America',
                 'country': 'United States',
                 'crunchbase': {'crunchbase_url': 'https://www.crunchbase.com/organization/hugging-face',
                                'crunchbase_uuid': 'b7947f18-b199-45ac-b7da-66f5c52fcfbc'},
                 'crunchbase_description': 'Hugging Face is building open-source tools for '
                                           'natural language processing',
                 'grid_info': '',
                 'grid_links': {'__html': ''},
                 'local_logo': 'hugging_face.png',
                 'market_filt': [],
                 'market_list': '',
                 'name': 'Hugging Face',
                 'parent_info': None,
                 'permid_info': '5063742076',
                 'permid_links': {'__html': "<a class='MuiTypography-root MuiLink-root "
                                            'MuiLink-underlineHover '
                                            "MuiTypography-colorPrimary' target='blank' "
                                            "rel='noreferrer' "
                                            "href='https://permid.org/1-5063742076'>5063742076</a>"},
                 'stage': 'Growth',
                 'unagg_child_info': None,
                 'website': 'https://huggingface.co/',
                 'yearly_ai_patents': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 'yearly_ai_publications': [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
                 'yearly_ai_pubs_top_conf': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                 'yearly_all_publications': [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0],
                 'years': [2010,
                           2011,
                           2012,
                           2013,
                           2014,
                           2015,
                           2016,
                           2017,
                           2018,
                           2019,
                           2020,
                           2021]}
        output = clean_row(input, False, {}, market_key_to_link)
        if output["local_logo"] != expected_output["local_logo"]:
            # then we're probably running on github actions and the images are not available
            assert not output["local_logo"] and not os.path.exists(os.path.join(IMAGE_DIR, "hugging_face.png"))
            output["local_logo"] = "hugging_face.png"
        self.assertEqual(output, expected_output)
