import React from 'react';
import {
  getByRole,
  getByText,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { userEventSetup } from '../util/testing';
import ListView from './ListView';

const INITIAL_COLUMNS = ['Company', 'Country', 'Region', 'Stage', 'AI publications', 'AI patents'];
const REMOVED_COLUMN = 'AI publications';

describe("ListView", () => {
  it("adjust filters and reset dropdown filters", async () => {
    const { user } = userEventSetup(
      <ListView />
    );

    // Filter by Europe and verify that the count updates
    expect(screen.getByText('Viewing 1304 companies')).toBeVisible();
    const regionHeader = screen.getByRole('columnheader', { name: /region/i });
    await user.click(getByRole(regionHeader, 'button'));
    const menu = screen.getByRole('listbox');
    await user.click(getByText(menu, 'Europe'));
    expect(screen.getByText('Viewing 89 of 1304 companies')).toBeVisible();

    // Reset the filters and verify that the count updates
    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    expect(screen.getByText('Viewing 1304 companies')).toBeVisible();
  });

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
      await waitForElementToBeRemoved(dialog);
      expect(screen.queryByRole('heading', { name: 'Add/remove columns'})).not.toBeInTheDocument();

      // Verify that the changes took effect
      for ( const column of INITIAL_COLUMNS.filter(e => e !== REMOVED_COLUMN) ) {
        expect(screen.getByRole('columnheader', { name: new RegExp(column, 'i') }));
      }
    });
  });
});
