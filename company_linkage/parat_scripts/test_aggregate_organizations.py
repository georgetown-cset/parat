import os
import unittest
import aggregate_organizations
from collections import defaultdict


# noinspection DuplicatedCode
class TestOrganization(unittest.TestCase):

    def test_init(self):
        org = aggregate_organizations.Organization(1, "test")
        self.assertEqual(org.cset_id, 1)
        self.assertEqual(org.name, "test")
        self.assertEqual(org.location, {})
        self.assertEqual(org.website, None)
        self.assertEqual(org.aliases, [])
        self.assertEqual(org.permid, None)
        self.assertEqual(org.child_permid, [])
        self.assertEqual(org.market, [])
        self.assertEqual(org.crunchbase, {})
        self.assertEqual(org.child_crunchbase, [])
        self.assertEqual(org.ror, [])
        self.assertEqual(org.regex, [])
        self.assertEqual(org.bgov_id, [])
        self.assertEqual(org.children, [])
        self.assertEqual(org.non_agg_children, [])
        self.assertEqual(org.parent, [])
        self.assertEqual(org.linkedin, [])
        self.assertFalse(org.in_sandp_500)
        self.assertFalse(org.in_fortune_global_500)

    def test_add_location(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_location("Palo Alto", "California", "USA")
        self.assertEqual(org.location, {"city": "Palo Alto", "province_state": "California", "country": "USA"})
        other_org = aggregate_organizations.Organization(2, "test_2")
        other_org.add_location(None, None, None)
        self.assertEqual(other_org.location, {})

    def test_add_website(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_website("https://google.com")
        self.assertEqual(org.website, "https://google.com")
        other_org = aggregate_organizations.Organization(2, "test_2")
        other_org.add_website(None)
        self.assertEqual(other_org.website, None)

    def test_add_alias(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_alias("English", "testing")
        self.assertEqual(org.aliases[0], {"alias_language": "English", "alias": "testing"})
        self.assertEqual(len(org.aliases), 1)
        org.add_alias("Spanish", "exámen")
        self.assertEqual(org.aliases[1], {"alias_language": "Spanish", "alias": "exámen"})
        self.assertEqual(len(org.aliases), 2)
        # Don't add a duplicate entry!
        org.add_alias("English", "testing")
        self.assertEqual(len(org.aliases), 2)

    def test_add_permid(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_permid(5035900246)
        self.assertEqual(org.permid, 5035900246)
        other_org = aggregate_organizations.Organization(2, "test_2")
        other_org.add_permid("")
        self.assertEqual(other_org.permid, None)

    def test_add_child_permid(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_child_permid(5035900246)
        self.assertEqual(org.child_permid[0], 5035900246)
        self.assertEqual(len(org.child_permid), 1)
        org.add_child_permid(4295903333)
        self.assertEqual(org.child_permid[1], 4295903333)
        self.assertEqual(len(org.child_permid), 2)
        # Don't add a duplicate entry!
        org.add_child_permid(4295903333)
        self.assertEqual(len(org.child_permid), 2)

    def test_add_market(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_market("nyse", "aep")
        self.assertEqual(org.market[0], {"exchange": "nyse", "ticker": "aep"})
        self.assertEqual(len(org.market), 1)
        # Don't add a duplicate entry!
        org.add_market("nyse", "aep")
        self.assertEqual(len(org.market), 1)
        # Do add a new one, even if the ticker is the same
        org.add_market("nasdaq", "aep")
        self.assertEqual(org.market[1], {"exchange": "nasdaq", "ticker": "aep"})
        self.assertEqual(len(org.market), 2)

    def test_add_crunchbase(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_crunchbase("5e300309-92e8-b336-d832-a65581e14b60",
                           "https://www.crunchbase.com/organization/popily")
        self.assertEqual(org.crunchbase, {"crunchbase_uuid": "5e300309-92e8-b336-d832-a65581e14b60",
                                          "crunchbase_url": "https://www.crunchbase.com/organization/popily"})
        other_org = aggregate_organizations.Organization(2, "test_2")
        other_org.add_crunchbase(None, None)
        self.assertEqual(other_org.crunchbase, {})

    def test_add_child_crunchbase(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_child_crunchbase("5e300309-92e8-b336-d832-a65581e14b60",
                                 "https://www.crunchbase.com/organization/popily")
        self.assertEqual(org.child_crunchbase[0], {"crunchbase_uuid": "5e300309-92e8-b336-d832-a65581e14b60",
                                                   "crunchbase_url": "https://www.crunchbase.com/organization/popily"})
        self.assertEqual(len(org.child_crunchbase), 1)
        # Don't add a duplicate entry!
        org.add_child_crunchbase("5e300309-92e8-b336-d832-a65581e14b60",
                                 "https://www.crunchbase.com/organization/popily")
        self.assertEqual(len(org.child_crunchbase), 1)
        # Do add a new one
        org.add_child_crunchbase("36b559b0-5ba8-4927-a925-59edbee1191d",
                                 "https://www.crunchbase.com/organization/eneos")
        self.assertEqual(org.child_crunchbase[1], {"crunchbase_uuid": "36b559b0-5ba8-4927-a925-59edbee1191d",
                                                   "crunchbase_url": "https://www.crunchbase.com/organization/eneos"})
        self.assertEqual(len(org.child_crunchbase), 2)
        # Don't add an entry if it's in the main crunchbase
        org.add_crunchbase("d77ea3aa-88f2-6a24-eff2-fec8333283d4",
                           "https://www.crunchbase.com/organization/algorithmia")
        org.add_child_crunchbase("d77ea3aa-88f2-6a24-eff2-fec8333283d4",
                                 "https://www.crunchbase.com/organization/algorithmia")
        self.assertEqual(len(org.child_crunchbase), 2)

    def test_add_ror(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_ror("https://ror.org/05a8p8995")
        self.assertEqual(org.ror[0], "https://ror.org/05a8p8995")
        self.assertEqual(len(org.ror), 1)
        # Don't add a duplicate entry!
        org.add_ror("https://ror.org/05a8p8995")
        self.assertEqual(len(org.ror), 1)
        # Do add a new one
        org.add_ror("https://ror.org/00kdbj440")
        self.assertEqual(org.ror[1], "https://ror.org/00kdbj440")
        self.assertEqual(len(org.ror), 2)

    def test_add_regex(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_regex(r"^hhi\s+corporation$|^hhi$|^hhi\s+corp$")
        self.assertEqual(org.regex[0], r"^hhi\s+corporation$|^hhi$|^hhi\s+corp$")
        self.assertEqual(len(org.regex), 1)
        # Don't add a duplicate entry!
        org.add_regex(r"^hhi\s+corporation$|^hhi$|^hhi\s+corp$")
        self.assertEqual(len(org.regex), 1)
        # Do add a new one
        org.add_regex(r"^hhi\s+corporation$")
        self.assertEqual(org.regex[1], r"^hhi\s+corporation$")
        self.assertEqual(len(org.regex), 2)

    def test_add_bgov_id(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_bgov_id(["684405"])
        self.assertEqual(org.bgov_id[0], "684405")
        self.assertEqual(len(org.bgov_id), 1)
        # Don't add a duplicate entry!
        org.add_bgov_id(["684405"])
        self.assertEqual(len(org.bgov_id), 1)
        # Do add a new one
        org.add_bgov_id(["773795"])
        self.assertEqual(org.bgov_id[1], "773795")
        self.assertEqual(len(org.bgov_id), 2)

    def test_add_parent(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_parent(False, "school", 3)
        self.assertEqual(org.parent[0], {"parent_acquisition": False, "parent_name": "school", "parent_id": 3})
        self.assertEqual(len(org.parent), 1)
        org.add_parent(True, "student", 4)
        self.assertEqual(org.parent[1], {"parent_acquisition": True, "parent_name": "student", "parent_id": 4})
        self.assertEqual(len(org.parent), 2)
        # Don't add a duplicate entry!
        org.add_parent(True, "student", 4)
        self.assertEqual(len(org.parent), 2)

    def add_child(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_child("quiz", 5)
        self.assertEqual(org.children[0], {"child_name": "quiz", "child_id": 5})
        self.assertEqual(len(org.children), 1)
        # Don't add a duplicate entry!
        org.add_child("quiz", 5)
        self.assertEqual(len(org.children), 1)
        # Do add a new one
        org.add_child("exam", 6)
        self.assertEqual(org.children[1], {"child_name": "exam", "child_id": 6})
        self.assertEqual(len(org.children), 2)

    def add_non_agg_child(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_non_agg_child("medical test", 7)
        self.assertEqual(org.non_agg_children[0], {"child_name": "medical test", "child_id": 7})
        self.assertEqual(len(org.non_agg_children), 1)
        # Don't add a duplicate entry!
        org.add_child("medical test", 7)
        self.assertEqual(len(org.non_agg_children), 1)
        # Do add a new one
        org.add_child("test match", 8)
        self.assertEqual(org.non_agg_children[1], {"child_name": "test match", "child_id": 8})
        self.assertEqual(len(org.non_agg_children), 2)

    def test_add_linkedin(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_linkedin("https://www.linkedin.com/company/test")
        self.assertEqual(len(org.linkedin), 1)
        self.assertEqual(org.linkedin[0], "https://www.linkedin.com/company/test")
        org.add_linkedin("https://www.linkedin.com/company/test2")
        self.assertEqual(len(org.linkedin), 2)
        self.assertEqual(org.linkedin[1], "https://www.linkedin.com/company/test2")
        org.add_linkedin("https://www.linkedin.com/company/test")
        self.assertEqual(len(org.linkedin), 2)

    def test_add_sandp(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_sandp(False)
        self.assertFalse(org.in_sandp_500)
        org.add_sandp(True)
        self.assertTrue(org.in_sandp_500)
        org.add_sandp(False)
        self.assertTrue(org.in_sandp_500)

    def test_add_fortune(self):
        org = aggregate_organizations.Organization(1, "test")
        org.add_fortune(False)
        self.assertFalse(org.in_fortune_global_500)
        org.add_fortune(True)
        self.assertTrue(org.in_fortune_global_500)
        org.add_fortune(False)
        self.assertTrue(org.in_fortune_global_500)



class TestOrganizationAggregator(unittest.TestCase):

    def test_init(self):
        aggregator = aggregate_organizations.OrganizationAggregator()
        self.assertEqual(aggregator.parent_names, {})
        self.assertEqual(aggregator.child_to_parent, defaultdict(list))
        self.assertEqual(aggregator.full_aggregate_child_to_parent, defaultdict(list))
        self.assertEqual(aggregator.organization_dict, {})

    @unittest.skipIf(not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"),
                     "No google credentials")
    def test_get_parents(self):
        aggregator = aggregate_organizations.OrganizationAggregator()
        aggregator.get_parents()
        # We should have at least as many non_agg_children as children:
        self.assertGreaterEqual(len(aggregator.full_aggregate_child_to_parent), len(aggregator.child_to_parent))
        # Non-rolled up orgs should be in full_aggregate
        # But not in child_to_parent
        for item in aggregate_organizations.no_roll_up:
            self.assertIn(item, aggregator.full_aggregate_child_to_parent)
            self.assertNotIn(item, aggregator.child_to_parent)
        # We're using a list for parents but by the end there should only be one parent for every org
        for parent_list in aggregator.child_to_parent.values():
            self.assertEqual(len(parent_list), 1)
        # And same for aggregated orgs
        for parent_list in aggregator.full_aggregate_child_to_parent.values():
            self.assertEqual(len(parent_list), 1)


if __name__ == '__main__':
    unittest.main()
