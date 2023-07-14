const path = require('path');

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions;

  console.info("Page - ", page.path); // DEBUG

  if ( page.path.match(/^\/company/) ) {
    createPage({
      path: "/company",
      matchPath: "/company/*",
      component: path.resolve("src/pages/company-detail.js"),
    });
  }
};
