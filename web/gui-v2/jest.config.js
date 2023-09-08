module.exports = {
  transform: {
    "^.+\\.jsx?$": `<rootDir>/jest-preprocess.js`,
  },
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss)$": `identity-obj-proxy`,
    ".+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": `<rootDir>/__mocks__/file-mock.js`,
    "^@components(.*)$": "<rootDir>/src/components$1",
    "^@content(.*)$": "<rootDir>/src/content$1",
  },
  testPathIgnorePatterns: [
    `node_modules`,
    `\\.cache`,
    `<rootDir>.*/public`,
  ],
  transformIgnorePatterns: [
    `node_modules/(?!(gatsby|gatsby-plugin-mdx|@eto|@mui|d3.*|internmap|delaunator|robust-predicates)/)`,
  ],
  globals: {
    __PATH_PREFIX__: ``,
  },
  setupFiles: [
    `<rootDir>/jest-loadershim.js`,
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest-setup-test-env.js',
  ],
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/pages/**',
    '!**/*.test.*',
    '!**/__tests__/**',
  ],
}
