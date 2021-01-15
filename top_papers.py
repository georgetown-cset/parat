import argparse

from get_ai_counts import CountGetter


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("output_file", type=str,
                        help="A jsonl file for writing output data to create new tables")
    args = parser.parse_args()
    if not args.output_file:
        parser.print_help()
        return
    if "jsonl" not in args.output_file:
        parser.print_help()
        return
    paper_finder = CountGetter(args.output_file)
    paper_finder.get_regex()
    # These are the only two lines that make this different from running AI pubs
    # We select from a different table
    table_name = "ai_companies_visualization.pubs_in_top_conferences_no_grid"
    # And we write out our data to a different variable
    companies = paper_finder.run_query_papers(table_name, "ai_pubs_in_top_conferences")
    paper_finder.write_output(companies)


if __name__ == "__main__":
    main()