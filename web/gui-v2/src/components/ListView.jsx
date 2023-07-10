import React from 'react';
import { css } from '@emotion/react';

import { classes } from '@eto/eto-ui-components';

import ListViewTable from './ListViewTable';
import { company_data } from '../static_data/data';

console.info("company_data:", company_data); // DEBUG

const styles = {};

const ListView = ({
  className: appliedClassName,
  css: appliedCss,
  id: appliedId
}) => {

  // TODO
  const filteredFilters = {
    "name": null,
    "country": null,
    "continent": null,
    "stage": null
  };


  return (
    <div
      className={classes("list-view", appliedClassName)}
      css={appliedCss}
      id={appliedId}
      data-testid="list-view"
    >
      <ListViewTable
        data={company_data}
        filteredFilters={filteredFilters}
      />
    </div>
  );
};

export default ListView;
