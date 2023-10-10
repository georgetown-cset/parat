import React from 'react';
import {
  getByRole,
  getByText,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { userEventSetup } from '../util/testing';
import ListView from './ListView';
import { exportsForTestingOnly } from './ListViewTable';

const { filterRow } = exportsForTestingOnly;

const INITIAL_COLUMNS = ['Company', 'Country', 'AI publications', 'AI patents', 'Tech Tier 1 jobs'];
const REMOVED_COLUMN = 'AI publications';

describe("ListView", () => {
  it("adjust filters and reset dropdown filters", async () => {
    const { user } = userEventSetup(
      <ListView />
    );

    // Filter by Europe and verify that the count updates
    expect(screen.getByText('Viewing 1760 companies')).toBeVisible();
    const regionHeader = screen.getByRole('columnheader', { name: /country/i });
    await user.click(getByRole(regionHeader, 'button'));
    const menu = screen.getByRole('listbox');
    await user.click(getByText(menu, 'China'));
    expect(screen.getByText('Viewing 267 of 1760 companies')).toBeVisible();

    // Reset the filters and verify that the count updates
    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    expect(screen.getByText('Viewing 1760 companies')).toBeVisible();
  }, 20000);

  describe("add/remove columns dialog", () => {
    it("opens the dialog and changes columns", async () => {
      const { user } = userEventSetup(
        <ListView />
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
      await user.click(getByRole(dialog, 'button', { name: 'Apply' }));
      await waitForElementToBeRemoved(() => screen.getByRole('dialog'));
      expect(screen.queryByRole('heading', { name: 'Add/remove columns'})).not.toBeInTheDocument();

      // Verify that the changes took effect
      for ( const column of INITIAL_COLUMNS.filter(e => e !== REMOVED_COLUMN) ) {
        expect(screen.getByRole('columnheader', { name: new RegExp(column, 'i') }));
      }
    }, 90000);
  });

  describe.skip('groups', () => {
    it('switches to custom group mode', async () => {
      const { user } = userEventSetup(
        <ListView />
      );

      const groupSelectorWrapper = screen.getByTestId('group-selector');
      await user.click(getByRole(groupSelectorWrapper, 'button'));

      // Verify that the groups we expect are present
      expect(screen.getByRole('option', { name: 'All companies' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'S&P 500' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Custom' })).toBeVisible();
      await user.click(screen.getByRole('option', { name: 'Custom' }));

      // We don't have any companies in our group yet, so no results should be shown
      expect(screen.getByText(/no companies selected/i)).toBeVisible();

      // Open the group editor dialog
      await user.click(screen.getByRole('button', { name: /edit custom group/i }));
      expect(screen.getByRole('heading', { name: 'Modify custom company group' })).toBeVisible();
      const dialog = screen.getByRole('dialog');
      const companyInput = getByRole(dialog, 'combobox');
      await user.click(companyInput);
      await user.type(companyInput, 'Microsoft');
      await user.click(getByRole(dialog, 'option', { name: 'Microsoft' }));
      await user.click(getByRole(dialog, 'button', { name: 'Apply' }));
      await waitForElementToBeRemoved(dialog);

      // Confirm that our group selection is present in the table
      const table = screen.getByRole('table');
      expect(getByRole(table, 'row', { name: /Microsoft/ })).toBeVisible();

      // Verify that a pre-existing group displays correctly
      await user.click(getByRole(groupSelectorWrapper, 'button', { name: 'Custom' }));
      expect(screen.getByRole('option', { name: 'S&P 500' })).toBeVisible();
      await user.click(screen.getByRole('option', { name: 'S&P 500' }));
      expect(getByRole(table, 'row', { name: /Microsoft/ })).toBeVisible();
      expect(getByRole(table, 'row', { name: /IBM/ })).toBeVisible();
      expect(getByRole(table, 'row', { name: /Google/ })).toBeVisible();
      expect(getByRole(table, 'row', { name: /Apple/ })).toBeVisible();
      expect(getByRole(table, 'row', { name: /3M/ })).toBeVisible();
    }, 60000);
  });


  describe("helper functions", () => {
    it("filtering rows works as expected", () => {
      const FILTERS_SP500 = {
        name: [ "GROUP:sandp_500" ],
        country: [],
        continent: [],
        stage: [],
      };
      const DJI = { cset_id: 78, name: "DJI", in_fortune_global_500: false, in_sandp_500: false };
      const HUAWEI = { cset_id: 112, name: "Huawei", in_fortune_global_500: false, in_sandp_500: true };
      const MICROSOFT = { cset_id: 163, name: "Microsoft", in_fortune_global_500: true, in_sandp_500: true };
      const SAMSUNG = { cset_id: 671, name: "Samsung", in_fortune_global_500: false, in_sandp_500: true };
      const THALES = { cset_id: 2794, name: "Thales SA", in_fortune_global_500: false, in_sandp_500: false };

      expect(filterRow(DJI, FILTERS_SP500)).toEqual(false);
      expect(filterRow(HUAWEI, FILTERS_SP500)).toEqual(true);
      expect(filterRow(MICROSOFT, FILTERS_SP500)).toEqual(true);
      expect(filterRow(SAMSUNG, FILTERS_SP500)).toEqual(true);
      expect(filterRow(THALES, FILTERS_SP500)).toEqual(false);
    });
  });
});
