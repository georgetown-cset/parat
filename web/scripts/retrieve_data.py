import json
import os

from google.cloud import bigquery

def retrieve_data():
    client = bigquery.Client()
    rows = []
    for row in client.list_rows("ai_companies_visualization.visualization_data"):
        row["name"] = row["name"].title()
        rows.append({col: row[col] for col in row.keys()})
    with open(os.path.join("ai_companies_viz", "src", "pages", "data.js"), mode="w") as out:
        out.write(f"const company_data = {json.dumps(rows)};\n\nexport {{ company_data }};")

if __name__ == "__main__":
    retrieve_data()