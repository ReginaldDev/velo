import { test, expect } from '../support/fixtures'

test('webapp deve estar online', async ({ app, page }) => {
  await app.orderLookup.open()

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Velô by Papito/)
})



