module.exports = {
  siteMetadata: {
    title: "parat",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        start_url: "/",
        icon: "src/images/favicon.ico", // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['UA-148144643-1'],
      },
    }
  ],
};
