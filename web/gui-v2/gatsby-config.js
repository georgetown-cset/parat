/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: `PARAT v2`,
    siteUrl: `https://parat.eto.tech`
  },
  plugins: [
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
  ],
};