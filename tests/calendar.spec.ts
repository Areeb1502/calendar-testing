import * as fs from 'fs';
import { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import {
  CAL,
  openView,
  createEvent,
  openEvent,
  deleteEvent,
  slot,
  daysToNextMonday,
  uniqueTitle,
  todayButton,
} from './helpers';

// Every test saves a screenshot named after its ID (screenshots/TC01.png ...).
// By default the screenshot is taken after the test ends. Event tests call
// evidence() at the moment of the check, while the event is still on screen,
// and then the end-of-test screenshot is skipped so the file is not overwritten.
const captured = new Set<string>();

async function evidence(page: Page) {
  const id = test.info().title.split(' ')[0];
  fs.mkdirSync('screenshots', { recursive: true });
  await page.waitForTimeout(1_000); // let the page finish drawing
  await page.screenshot({ path: `screenshots/${id}.png` });
  captured.add(id);
}

test.afterEach(async ({ page }, testInfo) => {
  const id = testInfo.title.split(' ')[0];
  if (captured.delete(id)) return;
  fs.mkdirSync('screenshots', { recursive: true });
  await page.waitForTimeout(1_000).catch(() => {});
  await page.screenshot({ path: `screenshots/${id}.png` }).catch(() => {});
});

// Each test uses its own date, far ahead and different on every run, so leftover
// events from earlier runs can never overlap the event a test is working with.
const RUN = 30 + (Math.floor(Date.now() / 60000) % 300);
const D = (n: number) => RUN + n * 9;

test.describe('Module 1 - Access and page elements', () => {
  test('TC01 Calendar opens for the logged-in user', async ({ page }) => {
    await page.goto(`${CAL}/month`);
    await expect(page).toHaveURL(/calendar\.google\.com\/calendar/);
    await expect(todayButton(page)).toBeVisible();
  });

  test('TC02 Page title contains the word Calendar', async ({ page }) => {
    await page.goto(`${CAL}/month`);
    await expect(page).toHaveTitle(/Calendar/);
  });

  test('TC03 Create button is visible', async ({ page }) => {
    await openView(page, 'month');
    await expect(page.getByRole('button', { name: /Create/ }).first()).toBeVisible();
  });

  test('TC04 Search button is visible', async ({ page }) => {
    await openView(page, 'month');
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeVisible();
  });

  test('TC05 Settings menu opens and shows Settings option', async ({ page }) => {
    await openView(page, 'month');
    await page.getByRole('button', { name: 'Settings menu' }).click();
    await expect(page.getByRole('menuitem', { name: /Settings/ }).first()).toBeVisible();
  });

  test('TC06 Mini calendar is displayed in the side panel', async ({ page }) => {
    await openView(page, 'month');
    await expect(page.getByRole('grid').first()).toBeVisible();
  });

  test('TC07 Session persists after page reload (no login prompt)', async ({ page }) => {
    await openView(page, 'month');
    await page.reload();
    await expect(page).not.toHaveURL(/accounts\.google\.com/);
    await expect(todayButton(page)).toBeVisible();
  });
});

test.describe('Module 2 - Calendar views', () => {
  test('TC08 Day view loads', async ({ page }) => {
    await openView(page, 'day');
    await expect(page).toHaveURL(/\/day/);
  });

  test('TC09 Week view loads', async ({ page }) => {
    await openView(page, 'week');
    await expect(page).toHaveURL(/\/week/);
  });

  test('TC10 Month view loads', async ({ page }) => {
    await openView(page, 'month');
    await expect(page).toHaveURL(/\/month/);
  });

  test('TC11 Year view loads', async ({ page }) => {
    await openView(page, 'year');
    await expect(page).toHaveURL(/\/year/);
  });

  test('TC12 Schedule (agenda) view loads', async ({ page }) => {
    await page.goto(`${CAL}/agenda`);
    await expect(page).toHaveURL(/\/agenda|\/schedule/);
    await expect(todayButton(page)).toBeVisible();
  });
});

test.describe('Module 3 - Date navigation', () => {
  test('TC13 Next arrow moves Month view forward by one month', async ({ page }) => {
    await openView(page, 'month', '2026/10/1');
    await page.getByRole('button', { name: /^Next/ }).first().click();
    await expect(page.getByText('November 2026').first()).toBeVisible();
  });

  test('TC14 Previous arrow moves Month view back by one month', async ({ page }) => {
    await openView(page, 'month', '2026/10/1');
    await page.getByRole('button', { name: /^Previous/ }).first().click();
    await expect(page.getByText('September 2026').first()).toBeVisible();
  });

  test('TC15 Today button returns to the current month', async ({ page }) => {
    await openView(page, 'month', '2020/1/1');
    await todayButton(page).click();
    const now = new Date();
    const label = `${now.toLocaleString('en-US', { month: 'long' })} ${now.getFullYear()}`;
    await expect(page.getByText(label).first()).toBeVisible();
  });

  test('TC16 Opening a specific date by URL shows that month', async ({ page }) => {
    await openView(page, 'month', '2026/12/1');
    await expect(page.getByText('December 2026').first()).toBeVisible();
  });

  test('TC17 Next arrow in Day view moves to the next day', async ({ page }) => {
    await openView(page, 'day', '2026/10/26');
    await page.getByRole('button', { name: /^Next/ }).first().click();
    await expect(page).toHaveURL(/\/day\/2026\/10\/27/);
  });
});

test.describe('Module 4 - Event management', () => {
  test('TC18 Create an event by typing its title in the editor', async ({ page }) => {
    const title = uniqueTitle('PW Typed Event');
    const s = slot(D(1));
    await page.goto(`https://calendar.google.com/calendar/render?action=TEMPLATE&dates=${s.dates}`);
    await page.getByRole('textbox', { name: /title/i }).first().fill(title);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeHidden({ timeout: 30_000 });
    await openView(page, 'week', s.path);
    await expect(page.getByText(title).first()).toBeVisible();
    await evidence(page);
    await deleteEvent(page, title);
  });

  test('TC19 Created event appears on the calendar grid', async ({ page }) => {
    const title = uniqueTitle('PW Grid Event');
    const s = slot(D(2));
    await createEvent(page, title, s.dates);
    await openView(page, 'week', s.path);
    await expect(page.getByText(title).first()).toBeVisible();
    await evidence(page);
    await deleteEvent(page, title);
  });

  test('TC20 Event details popup shows Edit and Delete options', async ({ page }) => {
    const title = uniqueTitle('PW Popup Event');
    const s = slot(D(3));
    await createEvent(page, title, s.dates);
    await openView(page, 'week', s.path);
    await openEvent(page, title);
    await expect(page.getByRole('button', { name: 'Edit event', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete event', exact: true })).toBeVisible();
    await evidence(page);
    await deleteEvent(page, title);
  });

  test('TC21 Event time is shown correctly (10:30 start)', async ({ page }) => {
    const title = uniqueTitle('PW Time Event');
    const s = slot(D(4));
    await createEvent(page, title, s.dates);
    await openView(page, 'week', s.path);
    await openEvent(page, title);
    await expect(page.getByText(/10:30/).first()).toBeVisible();
    await evidence(page);
    await deleteEvent(page, title);
  });

  test('TC22 Edit an event title', async ({ page }) => {
    const title = uniqueTitle('PW Edit Old');
    const newTitle = uniqueTitle('PW Edit New');
    const s = slot(D(5));
    await createEvent(page, title, s.dates);
    await openView(page, 'week', s.path);
    await openEvent(page, title);
    await page.getByRole('button', { name: 'Edit event', exact: true }).click();
    await page.getByRole('textbox', { name: /title/i }).first().fill(newTitle);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('button', { name: 'Save' })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000); // let Google finish saving the edit
    await openView(page, 'week', s.path);
    await expect(page.getByText(newTitle).first()).toBeVisible();
    await expect(page.getByText(title)).toHaveCount(0);
    await evidence(page);
    await deleteEvent(page, newTitle);
  });

  test('TC23 Delete an event removes it from the calendar', async ({ page }) => {
    const title = uniqueTitle('PW Delete Event');
    const s = slot(D(6));
    await createEvent(page, title, s.dates);
    await openView(page, 'week', s.path);
    await expect(page.getByText(title).first()).toBeVisible();
    await deleteEvent(page, title);
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test('TC24 Negative: event saved with no title appears as (No title)', async ({ page }) => {
    const s = slot(D(7));
    await createEvent(page, '', s.dates);
    await openView(page, 'week', s.path);
    await expect(page.getByText('(No title)').first()).toBeVisible();
    await evidence(page);
    await deleteEvent(page, '(No title)');
  });

  test('TC25 Create an all-day event', async ({ page }) => {
    const title = uniqueTitle('PW All Day');
    const s = slot(D(8));
    await createEvent(page, title, s.allDay);
    await openView(page, 'day', s.path);
    await expect(page.getByText(title).first()).toBeVisible();
    await evidence(page);
    await deleteEvent(page, title);
  });

  test('TC26 Create a daily recurring event (3 occurrences)', async ({ page }) => {
    const title = uniqueTitle('PW Recurring');
    const base = daysToNextMonday() + 7 * (60 + (RUN % 50));
    const s = slot(base);
    await createEvent(page, title, s.dates, 'RRULE:FREQ=DAILY;COUNT=3');
    // The event must appear on each of the 3 days...
    for (const k of [0, 1, 2]) {
      await openView(page, 'day', slot(base + k).path);
      await expect(page.getByText(title).first()).toBeVisible();
      if (k === 1) await evidence(page); // evidence: the series on day 2
    }
    // ...and must NOT appear on the 4th day.
    await openView(page, 'day', slot(base + 3).path);
    await expect(page.getByText(title)).toHaveCount(0);
    await openView(page, 'day', s.path);
    await deleteEvent(page, title);
  });

  test('TC27 Search finds a newly created event', async ({ page }) => {
    const title = uniqueTitle('PW Search Event');
    const s = slot(D(9));
    await createEvent(page, title, s.dates);
    await openView(page, 'week', s.path);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.keyboard.type(title);
    await page.keyboard.press('Enter');
    await expect(page.getByText(title).first()).toBeVisible({ timeout: 20_000 });
    await evidence(page);
    await openView(page, 'week', s.path);
    await deleteEvent(page, title);
  });
});

test.describe('Module 5 - Usability, performance and robustness', () => {
  test('TC28 Create menu offers the Event option', async ({ page }) => {
    await openView(page, 'month');
    await page.getByRole('button', { name: /Create/ }).first().click();
    await expect(page.getByText('Event', { exact: true }).first()).toBeVisible();
  });

  test('TC29 Layout still works at a small window size (800x600)', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto(`${CAL}/month`);
    await expect(page).toHaveURL(/calendar\.google\.com\/calendar/);
    await expect(todayButton(page)).toBeVisible();
  });

  test('TC30 Calendar loads within 15 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${CAL}/month`);
    await expect(todayButton(page)).toBeVisible();
    const seconds = (Date.now() - start) / 1000;
    console.log(`TC30 load time: ${seconds.toFixed(2)} s`);
    expect(seconds).toBeLessThan(15);
  });

  test('TC31 Unknown view name in the URL does not log the user out', async ({ page }) => {
    await page.goto(`${CAL}/notaview`);
    await expect(page).not.toHaveURL(/accounts\.google\.com/);
  });

  test('TC32 Browser Back button returns to the previous view', async ({ page }) => {
    await openView(page, 'month');
    await openView(page, 'week');
    await page.goBack();
    await expect(page).toHaveURL(/\/month/);
  });
});

test('TC34 Leap year rule: 2100 is NOT a leap year, 2000 is', async ({ page }) => {
  // 2100: divisible by 100 but not by 400, so no Feb 29. Feb 28 goes to Mar 1.
  await openView(page, 'day', '2100/2/28');
  await page.getByRole('button', { name: /^Next/ }).first().click();
  await expect(page).toHaveURL(/\/day\/2100\/3\/1/);

  // 2000: divisible by 400, so it IS a leap year. Feb 28 goes to Feb 29.
  await openView(page, 'day', '2000/2/28');
  await page.getByRole('button', { name: /^Next/ }).first().click();
  await expect(page).toHaveURL(/\/day\/2000\/2\/29/);
});