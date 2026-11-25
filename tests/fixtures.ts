import { test as base, chromium } from '@playwright/test';
import path from 'path';

// Every test opens real Chrome using the saved "chrome-profile" folder
// (the one created by login.js), so each test starts already logged in.
export const test = base.extend({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(
      path.resolve(__dirname, '..', 'chrome-profile'),
      {
        channel: 'chrome',
        headless: false,
        viewport: { width: 1366, height: 768 },
        ignoreDefaultArgs: ['--enable-automation'],
        args: ['--disable-blink-features=AutomationControlled'],
      }
    );
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    const page = context.pages()[0] ?? (await context.newPage());
    await use(page);
  },
});

export { expect } from '@playwright/test';