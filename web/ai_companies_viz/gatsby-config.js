module.exports = {
  siteMetadata: {
    title: "ai_companies_viz",
  },
  plugins: [
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        start_url: "/",
        icon: "src/images/favicon.ico", // This path is relative to the root of the site.
      },
    }
  ],
};
