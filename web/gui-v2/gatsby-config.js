
const { SLUGIFY_OPTIONS } = require('./src/util/constants.cjs');

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `PARAT v2`,
    siteUrl: `https://parat.eto.tech`
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-page-creator',
      options: {
        path: `${__dirname}/src/pages`,
        slugify: SLUGIFY_OPTIONS,
      },
    },
    "gatsby-plugin-emotion",
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['UA-148144643-1'],
      },
    },
    "gatsby-plugin-mdx",
    {
      resolve: 'gatsby-plugin-plausible',
      options: {
        domain: 'parat.eto.tech',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        "name": "pages",
        "path": "./src/pages/"
      },
      __key: "pages"
    },
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: './src/data/',
      },
    },
  ],
};