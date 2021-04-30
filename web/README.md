### Web artifacts and data preprocessing code for CARAT

This directory contains the code that processes the data generated in *[link to come]* for use in the CARAT website.
It also contains a Gatsby project that contains the CARAT website generation code.

To update the text that is used in the various explanatory tabs, edit the markdown files in `raw_data/text/`.
To update the tooltips, edit `src/static_data/tooltips.js`.

To populate the necessary data from a raw clone of this repository, run:

1.) `python3 scripts/mk_tab_text.py`. This will read the markdown text files in `raw_data/text` and output them
as a javascript object containing html snippets in `src/static_data/text.js`.

2.) Grab the raw data and reformat it into a javascript object. You will need a service account with translation 
and BigQuery reader permissions. To fully regenerate everything including images and Google Finance links 
(which take ~1.5 hours to generate), run: 
`python3 scripts/retrieve_data.py --refresh_raw --refresh_images --refresh_market_links`. Run
`python3 scripts/retrieve_data.py -h` for more detail on what these parameters do.

Next, to run the site in development mode, do:

```bash
cd parat 
gatsby develop
```

You should be able to view the site at `localhost:8000`.

When any changes are ready for deployment, do:

```bash
gatsby clean
gatsby build
```

And copy the files in the resulting `public` directory to *[update after production deployment]*.