import os
import sys
import unittest

myPath = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, myPath + '/../scripts/')

from web.scripts.mk_tab_text import clean
from web.scripts.retrieve_data import LINK_CSS


class TestMkTabText(unittest.TestCase):
    maxDiff = None

    def test_clean(self):
        input_md = """
## Here's a header

Here's some **bold** and *italic* text

And
- here's 
- a 
- list

With some other text after it and a [link](http://google.com)!
        """
        expected_output = [
            {'__html': "<h4>Here's a header</h4> Here's some <span style='font-weight: "
                    "bold'>bold</span> and <span "
                    "style='font-style:italic'>italic</span> text"},
            {'__html': 'And'},
            {'__html': "<ul><li style='margin:10px 0px'>here's</li>\n"
                    "<li style='margin:10px 0px'>a</li>\n"
                    "<li style='margin:10px 0px'>list</li></ul>"},
            {'__html': f"With some other text after it and a <a class={LINK_CSS} href='http://google.com' "
                       "target='_blank' rel='noreferrer'>link</a>!"}
        ]
        self.assertEqual(clean(input_md), expected_output)