import json
import os

def clean(s: str) -> str:
    return s

def mk_tab_text():
    text_parent = os.path.join("raw_data", "text")
    label_to_text = {}
    for fi_name in os.listdir(text_parent):
        if not fi_name.endswith(".md"):
            continue
        with open(os.path.join(text_parent, fi_name)) as f:
            label_to_text[fi_name.replace(".md", "")] = {"__html": clean(f.read())}
    with open(os.path.join("ai_companies_viz", "src", "static_data", "text.js"), mode="w") as out:
        out.write(f"const tab_text = {json.dumps(label_to_text)};\n\nexport {{ tab_text }};")

if __name__ == "__main__":
    mk_tab_text()