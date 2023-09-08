#! /usr/bin/env python3

## Example:
## src> ./scripts/filter_companies.py static_data/companies.json data/companies.json

import argparse
import json
import pprint

parser = argparse.ArgumentParser()
parser.add_argument('infile')
parser.add_argument('outfile')

args = parser.parse_args()

pp = pprint.PrettyPrinter(indent=1, compact=True)

with open(args.infile, 'r') as f:
  data = json.load(f)

#pp.pprint(data[0])
reduced_data = list(map(lambda d: { "cset_id": d["cset_id"], "name": d["name"] }, data))
#pp.pprint(reduced_data)

with open(args.outfile, 'w') as f:
  json.dump(reduced_data, f)
