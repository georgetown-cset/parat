import React from 'react';
import { css } from '@emotion/react';

import { Table } from '@eto/eto-ui-components';

import SectionHeading from './SectionHeading';

const styles = {
  tableWrapper: css`
    margin: 1rem auto;
    max-width: 808px;
  `,
  table: css`
    max-width: 808px;
  `,
};

const TableSection = ({
  className: appliedClassName,
  columns,
  css: appliedCss,
  data,
  id: appliedId,
  title,
}) => {
  return (
    <div
      className={appliedClassName}
      css={[styles.tableWrapper, appliedCss]}
    >
      <SectionHeading id={appliedId}>
        {title}
      </SectionHeading>
      <Table
        columns={columns}
        css={styles.table}
        data={data}
      />
    </div>
  );
};

export default TableSection;
