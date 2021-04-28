import json
import os
import re

from retrieve_data import LINK_CSS

"""
Puts a directory of markdown-formatted text for the tabbed overview, faq, etc. sections into a javascript array 
with elements to be consumed by React using dangerouslySetInnerHTML
"""

def clean(s: str) -> list:
    """
    Clean and reformat a markdown string as html
    :param s: markdown string
    :return: a JSON mapping the "__html" key expected by dangerouslySetInnerHTML to the html version of the input string
    """
    cleaned = []
    header_buffer = []
    ul_buffer = []
    for para in s.split("\n"):
        para = para.strip()
        if len(para) == 0:
            continue
        para = re.sub(r"\*\*([^\*]+)\*\*", r"<span style='font-weight: bold'>\1</span>", para)
        para = re.sub(r"\[([^\]]+)\]\(([^\)]+)\)",
                      (rf"<a class={LINK_CSS} "
                       r"href='\2' target='_blank' rel='noreferrer'>\1</a>"), para)
        para = re.sub(r"\*([^\*]+)\*", r"<span style='font-style:italic'>\1</span>", para)
        if para.startswith("##"):
            para = re.sub(r"^##\s+", "", para)
            para = f"<h4>{para}</h4>"
            header_buffer.append(para)
        elif para.startswith("-"):
            para = re.sub(r"^-\s+", "", para)
            ul_buffer.append(f"<li style='margin:10px 0px'>{para}</li>")
        else:
            if len(header_buffer) > 0:
                assert len(header_buffer) == 1
                cleaned.append({"__html": header_buffer[0]+" "+para})
                header_buffer = []
            elif len(ul_buffer) > 0:
                fmt_list = "\n".join(ul_buffer)
                cleaned.append({"__html": f"<ul>{fmt_list}</ul>"})
                cleaned.append({"__html": para})
                ul_buffer = []
            else:
                cleaned.append({"__html": para})
    assert len(header_buffer) == 0
    if len(ul_buffer) > 0:
        fmt_list = "\n".join(ul_buffer)
        cleaned.append({"__html": f"<ul>{fmt_list}</ul>"})
    return cleaned

def mk_tab_text():
    """
    Convert the text that will go in the tabs on the website from markdown to a JS array of html
    :return: None
    """
    text_parent = os.path.join("raw_data", "text")
    label_to_text = {}
    for fi_name in os.listdir(text_parent):
        if not fi_name.endswith(".md"):
            continue
        with open(os.path.join(text_parent, fi_name)) as f:
            label_to_text[fi_name.replace(".md", "")] = clean(f.read())
    with open(os.path.join("ai_companies_viz", "src", "static_data", "text.js"), mode="w") as out:
        out.write(f"const tab_text = {json.dumps(label_to_text)};\n\nexport {{ tab_text }};")

if __name__ == "__main__":
    mk_tab_text()