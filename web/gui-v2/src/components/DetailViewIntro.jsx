import React from 'react';
import { css } from '@emotion/react';

import { ExternalLink, Table, breakpoints } from '@eto/eto-ui-components';

const styles = {
  detailIntroWrapper: css`
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    width: 100%;

    ${breakpoints.tablet_small} {
      grid-template-columns: 1fr 300px;
    }
  `,
  descriptionBlurbs: css`
    small {
      color: var(--grey);
      font-size: 75%;

      a {
        color: var(--bright-blue);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `,
  metadataTable: css`
    margin: 0 auto;
    width: 300px;

    td {
      padding: 0.5rem;
    }
  `,
};

const DetailViewIntro = ({
  companyId,
  data,
}) => {

  const metadataColumns = [
    { display_name: "", key: "title" },
    {
      display_name: "",
      key: "data",
      align: "right",
      format: (val, row) => {
        if ( row.title === "Website" ) {
          return <ExternalLink href={val}>{val}</ExternalLink>;
        } else if ( row.title === "Stock tickers" ) {
          return val.map(e => <ExternalLink href={e.link}>{e.market_key}</ExternalLink>);
        } else {
          return val;
        }
      },
    },
  ];

  const metadataData = [
    { title: "Aliases", data: data.name },
    { title: "Country", data: data.country },
    { title: "Region", data: data.continent },
    { title: "Stage", data: data.stage },
    // { title: "Groupings", data: "S&P 500" },
    { title: "Website", data: data.website },
  ];

  if ( data.market_filt && data.market_filt.length > 0 ) {
    metadataData.push({
      title: "Stock tickers",
      data: data.market_filt,
    });
  }

  return (
    <div css={styles.detailIntroWrapper}>
      <div css={styles.descriptionBlurbs}>
        {data?.wikipedia_description ?
          <>
            <div>{data.wikipedia_description}</div>
            <small>
              <a href={data.wikipedia_link}>Wikipedia</a>, retrieved {data.description_retrieval_date}
            </small>
          </>
        :
          <div>No description available</div>
        }
      </div>
      <Table
        className="metadata-table"
        columns={metadataColumns}
        css={styles.metadataTable}
        data={metadataData}
        showHeader={false}
      />
    </div>
  );
};

export default DetailViewIntro;
