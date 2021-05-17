## Why isn't *[insert company here]* on the list?

We update PARAT's list of companies according to CSET's analytic needs and feedback from users. Adding new companies takes significant work, so we make these updates periodically. If you think a specific company should be added to PARAT, please [let us know](https://forms.gle/7RxrtAJHya2FmjXB6).

## Are all of these companies AI companies?

Not necessarily. Being included in PARAT, in and of itself, doesn't mean that a company is an "AI company" or is especially active in AI. We include companies in PARAT for a variety of reasons related to CSET's analytic needs and feedback from users.

## Why isn't *[insert company here]* ranked higher?

PARAT isn't meant to be a "top AI companies" list. Which companies are at the "top" depends on the metrics and companies that are considered. For example, some companies may have lots of AI-related patents, others might sell a lot of AI products, and others might hire a lot of talented AI engineers. PARAT doesn't cover all of the metrics and companies that would be needed to draw general conclusions about which companies are ahead of others in AI, and it doesn't make judgments about whether some metrics are more important than others.

The numerical rankings that appear in PARAT, displayed alongside our patent and publication metrics, are generated automatically from our patent and publication datasets. They reflect how each company compares to the other companies in PARAT according to these specific metrics - not whether that company is more innovative or capable in AI overall.

## Do you include subsidiaries when you calculate metrics for each company?

In most cases, yes. PARAT includes parent-subsidiary mappings for many companies. When a subsidiary is mapped to a parent, the subsidiary's publications, patents, etc. are attributed to the parent company. (The "Included Subsidiaries" metadata field for each parent company lists any subsidiaries treated this way.) In other cases, our data sources already consolidate a subsidiary's data with its parent, or the queries we run on those data sources collect parent and subsidiary data together by design. We believe most PARAT companies' subsidiaries' data are ultimately "rolled up" to the parent level in one of these ways.

## Can I get the raw data that goes into PARAT?

You can use PARAT's download feature to extract the descriptive information, metrics and metadata displayed in the PARAT web interface. We also share the code used to generate PARAT in our [GitHub repo](https://github.com/georgetown-cset/parat). Licensing restrictions prevent us from sharing the underlying publication and patent [data sources](_____), but if you have access to these datasets (some of which are free), you can use PARAT metadata to efficiently query them. For example, you can use the GRID identifiers compiled in PARAT to quickly find a company's publications in databases like [Dimensions](https://www.dimensions.ai/) or [Microsoft Academic Graph](https://www.microsoft.com/en-us/research/project/microsoft-academic-graph/).

## Can you tell me more about how to use PARAT?

- You can filter the set of companies displayed using the dropdowns and sliders. You may select multiple values within each dropdown. The rankings displayed are relative to the entire list of companies in PARAT and do not change when the data is filtered.
- The displayed metric values are color-coded to indicate their relative size compared to the largest value of that metric.
- You can download an export of the currently selected data using the "Download Results" button. To download an export of all data, make sure you clear any filters you have set before clicking "Download Results".

## Could you please add *[insert feature here]*?

Maybe! PARAT is a work in progress, and we hope to add several new features in the coming months. You can suggest new features [here](https://forms.gle/7RxrtAJHya2FmjXB6).

## I see a problem!

Please [let us know](https://forms.gle/7RxrtAJHya2FmjXB6). We appreciate your help improving the tool!
