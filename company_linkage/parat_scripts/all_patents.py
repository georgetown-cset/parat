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
    patent_finder = CountGetter()
    patent_finder.get_identifiers()
    # These are the only two lines that make this different from running AI patents
    # We select from a different table and AI is false
    table_name = "linked_all_patents"
    # And we write out our data to a different variable
    companies = patent_finder.run_query_id_patents(table_name, ai=False, test=True)
    patent_finder.write_output(companies, args.output_file)


if __name__ == "__main__":
    main()