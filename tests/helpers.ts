import { Page, expect } from '@playwright/test';

export const CAL = 'https://calendar.google.com/calendar/u/0/r';

/** The Today button (its accessible name may be 'Today' or 'Go to today'). */
export const todayButton = (page: Page) => page.getByRole('button', { name: /today/i }).first();

export type View = 'day' | 'week' | 'month' | 'year' | 'agenda';

export const uniqueTitle = (prefix: string) => `${prefix} ${Date.now()}`;

/** Open a calendar view, optionally at a date like '2026/12/25'. */
export async function openView(page: Page, view: View, date?: string) {
  await page.goto(`${CAL}/${view}${date ? '/' + date : ''}`);
  await expect(todayButton(page)).toBeVisible({
    timeout: 30_000,
  });
}

/** A date `daysAhead` days from today, at 10:30-11:30, in the formats Calendar needs. */
export function slot(daysAhead: number, start = '103000', end = '113000') {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const ymd = `${y}${String(m).padStart(2, '0')}${String(day).padStart(2, '0')}`;
  return {
    dates: `${ymd}T${start}/${ymd}T${end}`,
    allDay: `${ymd}/${ymd}`,
    path: `${y}/${m}/${day}`,
  };
}

/** Days from today until a Monday that is at least 7 days away (keeps recurring tests inside one week). */
export function daysToNextMonday() {
  const dow = new Date().getDay();
  return (((8 - dow) % 7) || 7) + 7;
}

/** Create an event by opening Calendar's "create event" link and pressing Save. */
export async function createEvent(page: Page, title: string, dates: string, recur?: string) {
  let url =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    `&text=${encodeURIComponent(title)}&dates=${dates}`;
  if (recur) url += `&recur=${encodeURIComponent(recur)}`;
  await page.goto(url);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: 'Save' })).toBeHidden({ timeout: 30_000 });
  await page.waitForTimeout(2_000); // let Google finish saving
}

/** Click an event on the grid so its details popup opens. */
export async function openEvent(page: Page, title: string) {
  await page.getByText(title).first().click();
  await expect(page.getByRole('button', { name: 'Delete event', exact: true })).toBeVisible();
}

/** Delete an event (handles the "recurring event" dialog by choosing All events). */
export async function deleteEvent(page: Page, title: string) {
  const deleteButton = page.getByRole('button', { name: 'Delete event', exact: true });
  // The details panel may already be open, or may have just closed again.
  // Open it only when it is not visible, and retry before giving up.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await deleteButton.isVisible()) break;
    await page.getByText(title).first().click();
    await deleteButton.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
  }
  await deleteButton.click();
  // Recurring events show a prompt: This event / This and following events / All events.
  // Find the option by role OR by its visible text, because Google changes the markup.
  const allEvents = page
    .getByRole('radio', { name: /all events/i })
    .or(page.getByText('All events', { exact: true }))
    .first();
  const promptShown = await allEvents
    .waitFor({ state: 'visible', timeout: 4_000 })
    .then(() => true)
    .catch(() => false);
  if (promptShown) {
    await allEvents.click();
    await page
      .getByRole('button', { name: 'OK', exact: true })
      .or(page.getByText('OK', { exact: true }))
      .first()
      .click();
  }
  await expect(page.getByText(title)).toHaveCount(0, { timeout: 15_000 });
}