import React from 'react';
import { CacheProvider } from '@emotion/react';
import {
  getByRole,
  getByText,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { emotionCache, userEventSetup } from '../util/testing';
import ListView from './ListView';
import { exportsForTestingOnly } from './ListViewTable';

const { extractCurrentFilters, filterRow } = exportsForTestingOnly;

const INITIAL_COLUMNS = ['Company', 'Country', 'AI publications', 'AI patents', 'AI jobs', 'Tech Tier 1 jobs'];
const REMOVED_COLUMN = 'AI publications';

describe("ListView", () => {
  it("adjust filters and reset dropdown filters", async () => {
    const { user } = userEventSetup(
      <CacheProvider value={emotionCache}>
        <ListView />
      </CacheProvider>
    );

    // Filter by China and verify that the count updates
    expect(screen.getByText('Viewing 691 companies')).toBeVisible();
    const regionHeader = screen.getByRole('columnheader', { name: /country/i });
    await user.click(getByRole(regionHeader, 'button', { name: /open/i }));
    const menu = screen.getByRole('listbox');
    await user.click(getByText(menu, 'China'));
    expect(screen.getByText('Viewing 43 of 691 companies')).toBeVisible();

    // Reset the filters and verify that the count updates
    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    expect(screen.getByText('Viewing 691 companies')).toBeVisible();
  }, 20000);


  it("selects a group of companies", async () => {
    const { user } = userEventSetup(
      <CacheProvider value={emotionCache}>
        <ListView />
      </CacheProvider>
    );

    const companyHeader = screen.getByRole('columnheader', { name: /company/i });
    await user.click(getByRole(companyHeader, 'combobox'));
    const menu = screen.getByRole('listbox');
    await user.click(getByText(menu, 'S&P 500'));
    expect(screen.getByText('Viewing 500 of 691 companies')).toBeVisible();
  }, 20000);


  describe("add/remove columns dialog", () => {
    it("opens the dialog and changes columns", async () => {
      const { user } = userEventSetup(
        <CacheProvider value={emotionCache}>
          <ListView />
        </CacheProvider>
      );

      for ( const column of INITIAL_COLUMNS ) {
        expect(screen.getByRole('columnheader', { name: new RegExp(column, 'i') }));
      }

      // Open the dialog and verify that it is present
      await user.click(screen.getByRole('button', { name: /add\/remove columns/i }));
      expect(screen.getByRole('heading', { name: 'Add/remove columns'})).toBeVisible();
      const dialog = screen.getByRole('dialog');
      expect(getByRole(dialog, 'button', { name: 'Cancel' })).toBeVisible();
      expect(getByRole(dialog, 'button', { name: 'Apply' })).toBeVisible();

      // Deselect a column and apply the changes
      const removedCheckbox = getByRole(dialog, 'checkbox', { name: REMOVED_COLUMN })
      expect(removedCheckbox.checked).toEqual(true);
      await user.click(removedCheckbox);
      expect(removedCheckbox.checked).toEqual(false);
      let dialogRemoved = waitForElementToBeRemoved(screen.getByRole('dialog'));
      await user.click(getByRole(dialog, 'button', { name: 'Apply' }));
      await dialogRemoved;
      expect(screen.queryByRole('heading', { name: 'Add/remove columns'})).not.toBeInTheDocument();

      // Verify that the changes took effect
      for ( const column of INITIAL_COLUMNS.filter(e => e !== REMOVED_COLUMN) ) {
        expect(screen.getByRole('columnheader', { name: new RegExp(column, 'i') }));
      }
    }, 90000);
  });


  describe("helper functions", () => {
    it("filtering rows works as expected", () => {
      const FILTERS_RAW = {
        name: {
          get: [ "GROUP:sp500", "Affectiva" ],
        },
      };

      const FILTERS_TRANSFORMED = extractCurrentFilters(FILTERS_RAW);

      expect(FILTERS_TRANSFORMED).toEqual({
        _groups: [ "sp500" ],
        _companies: [ "Affectiva" ],
        name: [ "GROUP:sp500", "Affectiva" ],
      });

      const MICROSOFT = { cset_id: 916, name: "Microsoft", groups: { sp500: true, global500: true } };
      const SAMSUNG = { cset_id: 1202, name: "Samsung", groups: { sp500: true, global500: false } };
      const YASKAWA = { cset_id: 1525, name: "Yaskawa", groups: { sp500: false, global500: false } };
      const QUALCOMM = { cset_id: 1132, name: "Qualcomm", groups: { sp500: false, global500: true } };
      const AFFECTIVA = { cset_id: 45, name: "Affectiva", groups: { sp500: false, global500: false } };

      expect(filterRow(MICROSOFT, FILTERS_TRANSFORMED)).toEqual(true);
      expect(filterRow(SAMSUNG, FILTERS_TRANSFORMED)).toEqual(true);
      expect(filterRow(YASKAWA, FILTERS_TRANSFORMED)).toEqual(false);
      expect(filterRow(QUALCOMM, FILTERS_TRANSFORMED)).toEqual(false);
      expect(filterRow(AFFECTIVA, FILTERS_TRANSFORMED)).toEqual(true);
    });
  });
});
