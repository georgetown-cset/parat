import unittest

from scripts.mk_tab_text import clean

class TestMkTabText(unittest.TestCase):
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
            {'__html': "With some other text after it and a <a class='MuiTypography-root MuiLink-root "
                       "MuiLink-underlineHover MuiTypography-colorPrimary' href='http://google.com' "
                       "target='_blank' rel='noreferrer'>link</a>!"}
        ]
        self.assertEqual(clean(input_md), expected_output)