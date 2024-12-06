
export const MOCK_COMPANIES = [
  {
    cset_id: 1,
    name: "ABC Corporation",
    continent: "North America",
    country: "United States",
    linkedin: [ "https://example.com" ],
    groups: {
      sp500: true,
      genAI: false,
    },
    articles: {
      ai_publications: { rank: 1, total: 5678 },
    },
    patents: {
      ai_patents: { rank: 3, total: 777 },
    },
    other_metrics: {
      ai_jobs: { rank: 8, total: 45 },
      tt1_jobs: { rank: 2, total: 250 },
    },
  },
  {
    cset_id: 2,
    name: "DEF Corporation",
    continent: "Europe",
    country: "Luxembourg",
    linkedin: [ "https://example.com" ],
    groups: {
      sp500: true,
      genAI: true,
    },
    articles: {
      ai_publications: { rank: 5, total: 1115 },
    },
    patents: {
      ai_patents: { rank: 2, total: 999 },
    },
    other_metrics: {
      ai_jobs: { rank: 3, total: 150 },
      tt1_jobs: { rank: 7, total: 97 },
    },
  },
  {
    cset_id: 3,
    name: "GHI Incorporated",
    continent: "North America",
    country: "Canada",
    linkedin: [ "https://example.com" ],
    groups: {
      sp500: false,
      genAI: true,
    },
    articles: {
      ai_publications: { rank: 8, total: 56 },
    },
    patents: {
      ai_patents: { rank: 14, total: 120 },
    },
    other_metrics: {
      ai_jobs: { rank: 21, total: 12 },
      tt1_jobs: { rank: 41, total: 22 },
    },
  },
  {
    cset_id: 4,
    name: "The JKL Company",
    continent: "North America",
    country: "United States",
    linkedin: [ "https://example.com" ],
    groups: {
      sp500: false,
      genAI: false,
    },
    articles: {
      ai_publications: { rank: 99, total: 1 },
    },
    patents: {
      ai_patents: { rank: 12, total: 135 },
    },
    other_metrics: {
      ai_jobs: { rank: 75, total: 1 },
      tt1_jobs: { rank: 36, total: 29 },
    },
  },
];
