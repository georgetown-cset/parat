# 🦜 PARAT: CSET's Private-sector AI-Related Activity Tracker

This repository contains the code that generates [PARAT](https://parat.eto.tech).

* [company_linkage](/company_linkage) contains the code that generates the data behind PARAT:
company resolution across datasets, publication counts, etc.

* [web/gui-v2](/web/gui-v2) contains the code that generates the PARAT website from the company_linkage data.


## Setup

The project python dependencies are listed in `requirements.txt`. Before running code in this repo:

1. Make a new virtualenv:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. `export GOOGLE_APPLICATION_CREDENTIALS=<path to your credentials>` - a service account json. You should have at``
least BQ reader permissions, if you are a CSET user. If you are not a CSET user, then you will not be able to
run some of this code as-is, since it depends on our internal BigQuery datasets. Please contact us if you are
interested in collaborating or spot any issues.

3. [Do any data updates and install and run the web interface](/web/README.md)
