import React from 'react';
import { css } from '@emotion/react';

import { Table } from '@eto/eto-ui-components';

const styles = {
  wrapper: css`
    display: flex;
    justify-content: space-between;
    width: 100%;
  `,
  descriptionBlurbs: css``,
  metadataTable: css`
    margin-top: 0;
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
    { display_name: "", key: "data", align: "right" },
  ];

  const metadataData = [
    { title: "Aliases", data: data.name },
    { title: "Country", data: data.country },
    { title: "Region", data: data.continent },
    { title: "Stage", data: data.stage },
    { title: "Groupings", data: "S&P 500" },
  ];

  return (
    <div css={styles.wrapper}>
      <div css={styles.descriptionBlurbs}>
        Description blurbs about the company go here....
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
