import React from 'react';
import { css } from '@emotion/react';
import { Router } from '@reach/router';

import { AppWrapper, InfoCard } from '@eto/eto-ui-components';

import DetailView from '../components/DetailView';
import '../accessibility.css';

const styles = {};

const CompanyDetailPage = () => {

  return (
    <AppWrapper>
      <DetailView />
    </AppWrapper>
  );
};

export default CompanyDetailPage;

export const Head = () => <title>COMPANY DETAIL PAGE &ndash; PARAT &ndash; Emerging Technology Observatory</title>;
