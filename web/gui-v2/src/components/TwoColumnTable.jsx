import React from 'react';
import { css } from '@emotion/react';

import { classes } from '@eto/eto-ui-components';

const styles = {
  table: css`
    border-collapse: collapse;
    border-spacing: 0;
    display: table;
    font-family: GTZirkonLight;
    letter-spacing: 0.01071em;
    line-height: 1.43;
    width: 100%;

    th,
    td {
      background-color: white;
      border: 1px solid var(--bright-blue);
      font-size: 0.875rem;
      padding: 0.5rem;
    }

    th {
      font-weight: normal;
      text-align: left;
    }

    td {
      text-align: right;
    }
  `,
  notFound: css`
    color: var(--grey);
    font-style: italic;
  `,
};

const TwoColumnTable = ({
  className: appliedClassName,
  css: appliedCss,
  data,
  id: appliedId,
}) => {
  return (
    <table
      className={classes([
        'two-column-table',
        appliedClassName,
      ])}
      css={[
        styles.table,
        appliedCss,
      ]}
      id={appliedId}
    >
      <tbody>
        {data.map((row) => (
          <tr key={row.title}>
            <th scope="row">{row.title}</th>
            <td>{row.value ?? <span css={styles.notFound}>None found</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TwoColumnTable;
