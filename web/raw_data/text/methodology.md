We select companies for inclusion in CARAT based on our analytic needs and feedback from users. (CARAT does *not* cover all AI-related companies, and the sample it does cover isn't necessarily representative.) CSET annotators map each company to a set of unique identifiers, including [GRID](https://www.grid.ac/) (used in academic publication datasets), [Crunchbase UUID](https://data.crunchbase.com/v3.1/docs/uuid) (for the Crunchbase investment dataset), [PermID](https://permid.org/) (for use with Refinitiv data and other PermID-compatible datasets), and regular expressions that precisely capture the company's name and known aliases.

CARAT uses these identifiers to pull relevant data from our data sources, such as company logos and locations in the Crunchbase Open Data Map. Some CARAT fields involve more complex operations:

- **AI Publications** are computed using author affiliation data in CSET's global academic publications dataset. We isolate AI-related publications using CSET's [AI paper classifier](https://arxiv.org/abs/2002.07143), extract information about their authors' institutional affiliations, then link these institutions to CARAT companies using GRID identifiers (where available) or regular expressions. Displayed totals cover the last 10 years.

- **AI Publications in Top Conferences** are computed the same way as overall publication counts, but using a smaller subset of our publications dataset: papers from top AI conferences, as identified by [csrankings.org](http://csrankings.org/). These conferences are the AAAI Conference on Artificial Intelligence (AAAI), International Joint Conference on Artificial Intelligence (IJCAI), IEEE Conference on Computer Vision and Pattern Recognition (CVPR), European Conference on Computer Vision (ECCV), IEEE International Conference on Computer Vision (ICCV), International Conference on Machine Learning, International Conference on Knowledge Discovery Data Mining (SIGKDD), Conference on Neural Information Processing Systems (NeurIPS), Annual Meeting of the Association for Computational Linguistics (ACL), North American Chapter of the Association for Computational Linguistics (NAACL), Conference on Empirical Methods in Natural Language Processing (EMNLP), International Conference on Research and Development in Information Retrieval (SIGIR), and the Web Conference (WWW). Displayed totals cover the last 10 years.

- **AI Patents** are computed from CSET's global dataset of AI patents, which includes deduplicated data from Digital Science Dimensions and 1790 Analytics. (AI patents are [identified using Cooperative Patent Classifications](https://github.com/georgetown-cset/1790-ai-patent-data/blob/master/Define_Patent_Universe.md).) We match CARAT companies to the current assignees of each AI patent using GRID identifiers (where available) or regular expressions. We count all members of a [patent family](https://en.wikipedia.org/wiki/Patent_family) together (that is, as one single patent), and attribute to each company the patents for which it either was the original assignee, or is the current assignee. Displayed totals cover the last 10 years.

- Company **stages** are generated using Crunchbase Pro data and a simple algorithm. "Mature" companies are publicly traded, have more than a thousand employees, or last raised funding in late-stage venture capital or private equity rounds (e.g., Series D or post-IPO rounds). "Growth" companies last raised funding in mid-stage rounds (i.e., Series A-C). "Startup" companies last raised funding in early-stage rounds (e.g., seed or angel).

CSET annotators also manually collect some metadata for the companies in CARAT, including parent-subsidiary information, aliases, and some business descriptions.

**[________Confirm timespans stated above]**

**[________How often data are updated]**

**[________Any other technical details Jennifer/Rebecca see fit to include - backend architecture, etc.]**