
// Common options when slugifying company names.  This needs to be accessible
// both from `gatsby-config.js` (CJS, where the Gatsby pages are built) and from
// `src/util/index.js` (ESM, used to generate the links to the pages), so the
// file has to be CJS.
exports.SLUGIFY_OPTIONS = {
  customReplacements: [
    ['/', ''],
    ['\'', ''],
  ],
};
