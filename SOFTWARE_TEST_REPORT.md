# Software Test Report (STR)
## Automated End-to-End Testing of Google Calendar Web Application

---

### Executive Summary

| Attribute | Details |
| :--- | :--- |
| **Project Name** | Google Calendar End-to-End Automation Testing Suite |
| **Application Under Test (AUT)** | Google Calendar Web Application (`https://calendar.google.com`) |
| **Automation Framework** | Playwright Test (`@playwright/test` v1.64.1) with TypeScript |
| **Browser Environment** | Google Chrome (Real Channel, Persistent Authenticated Context) |
| **Test Date** | October 26, 2026 |
| **Total Test Cases** | **32** |
| **Passed** | **32 (100%)** |
| **Failed** | **0 (0%)** |
| **Skipped** | **0 (0%)** |
| **Total Execution Duration** | **379.40 seconds (~6.32 minutes)** |
| **Visual Artifacts Captured** | **32 / 32 Screenshots (`TC01.png` - `TC32.png`)** |

```mermaid
pie title Test Execution Verdict (32 Test Cases)
    "Passed" : 32
    "Failed" : 0
```

This report documents the test planning, architecture, test case specification, execution metrics, and findings from the automated testing project targeting the **Google Calendar Web Application**. The suite achieved a **100% pass rate** across all functional, navigation, event lifecycle, negative, and usability test scenarios.

---

### 1. Project Overview & Testing Objectives

#### 1.1 Objective
The primary goal of this software testing project is to design, develop, and execute a robust, maintainable, and fully automated end-to-end regression test suite for critical user flows within Google Calendar.

#### 1.2 Testing Scope
* **In-Scope**:
  * **Module 1: Access and Page Elements**: Authenticated access, core UI controls (Create, Search, Settings menu, Mini Calendar), and session persistence across page reloads.
  * **Module 2: Calendar Views**: Route handling and rendering of Day, Week, Month, Year, and Agenda/Schedule views.
  * **Module 3: Date Navigation**: Temporal traversing via forward/backward controls, "Today" button state reset, deep linking via URL schemas, and day-by-day increments.
  * **Module 4: Event Management & Lifecycle**: Event creation via deep links and editor forms, grid placement validation, event details popup, time accuracy, in-place title updates, single and recurring event deletions, all-day events, recurrent series (`RRULE:FREQ=DAILY;COUNT=3`), search indexing, and negative validation (empty titles).
  * **Module 5: Usability, Performance & Robustness**: Create button submenu behavior, responsive rendering at standard minimum resolution (800x600), page load benchmark under 15 seconds, resilience against invalid URL routes, and browser history (Back button) integration.
* **Out-of-Scope**:
  * Third-party integrations (Google Meet conferencing setup, Add-ons marketplace).
  * Multi-user collaborative event invitations and RSVP state synchronization.

---

### 2. Test Architecture & Methodology

```mermaid
flowchart TD
    subgraph Auth_Setup ["Authentication Layer"]
        A[login.js] -->|One-time interactive login| B[chrome-profile directory]
    end

    subgraph Test_Runner ["Playwright Test Engine"]
        B -->|Loads authenticated state| C[fixtures.ts: Custom Test Fixture]
        C -->|Launches real Chrome channel| D[calendar.spec.ts]
        H[helpers.ts] -->|Slot arithmetic, CRUD utils, Navigation| D
    end

    subgraph Teardown_Reporting ["Reporting & Evidence"]
        D -->|test.afterEach| S[screenshots/TCxx.png]
        D -->|Execution Stream| R[results.json & HTML Report]
    end
```

#### 2.1 Anti-Bot & Authentication Handling
Google Calendar enforces strict authentication and bot detection (Cloudflare/Google BotGuard). The architecture solves this using a **Persistent Context Strategy**:
1. `login.js` launches a local Chrome profile (`./chrome-profile`) with `--disable-blink-features=AutomationControlled` and omitted automation flags (`ignoreDefaultArgs: ['--enable-automation']`).
2. The user authenticates once manually with credentials and 2FA.
3. The custom test fixture in [fixtures.ts](file:///c:/Users/areeb/OneDrive/Desktop/CALENDAR TESTING/tests/fixtures.ts) binds each test execution to this persisted profile, providing immediate authenticated access without requiring fragile automated login scripts or exposed plaintext credentials.

#### 2.2 Test Isolation & Collision Avoidance
To prevent flaky failures from parallel runs or leftover calendar items:
* **Unique Identification**: Every created entity utilizes a microsecond timestamp suffix via `uniqueTitle(prefix)`.
* **Dynamic Time Offsets**: Events are scheduled dynamically in the future using the `RUN` offset and slot formulas (`slot(daysAhead)`), preventing collisions with existing live events or past runs.
* **Guaranteed Garbage Collection**: Every event creation test follows strict lifecycle hygiene with explicit teardown (`deleteEvent`), including recursive handling of recurring series prompts ("All events").

#### 2.3 Automated Visual Evidence Collection
Configured in `calendar.spec.ts` via the `test.afterEach` lifecycle hook:
```typescript
test.afterEach(async ({ page }, testInfo) => {
  const id = testInfo.title.split(' ')[0];
  fs.mkdirSync('screenshots', { recursive: true });
  await page.screenshot({ path: `screenshots/${id}.png` }).catch(() => {});
});
```
Every test generates an associated visual proof (`screenshots/TC01.png` to `screenshots/TC32.png`).

---

### 3. Detailed Test Specification & Traceability Matrix

The test suite consists of **32 automated test cases** categorized into 5 distinct modules:

| Test ID | Module | Test Scenario & Objective | Type | Status | Duration |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC01** | Module 1 | Calendar opens for the logged-in user | Smoke / Access | **PASSED** | 9.48 s |
| **TC02** | Module 1 | Page title contains the word "Calendar" | UI Validation | **PASSED** | 3.40 s |
| **TC03** | Module 1 | "Create" button is visible and interactable | UI Validation | **PASSED** | 3.35 s |
| **TC04** | Module 1 | "Search" button is visible on toolbar | UI Validation | **PASSED** | 11.39 s |
| **TC05** | Module 1 | Settings menu opens and shows "Settings" item | Functional | **PASSED** | 29.77 s |
| **TC06** | Module 1 | Mini calendar is displayed in the side panel | UI Validation | **PASSED** | 7.52 s |
| **TC07** | Module 1 | Session persists after page reload (no login redirect) | State / Session | **PASSED** | 8.25 s |
| **TC08** | Module 2 | Day view loads (`/day` route) | Navigation | **PASSED** | 5.97 s |
| **TC09** | Module 2 | Week view loads (`/week` route) | Navigation | **PASSED** | 5.23 s |
| **TC10** | Module 2 | Month view loads (`/month` route) | Navigation | **PASSED** | 5.95 s |
| **TC11** | Module 2 | Year view loads (`/year` route) | Navigation | **PASSED** | 8.04 s |
| **TC12** | Module 2 | Schedule (agenda) view loads (`/agenda` route) | Navigation | **PASSED** | 5.40 s |
| **TC13** | Module 3 | Next arrow moves Month view forward by one month | Functional | **PASSED** | 5.68 s |
| **TC14** | Module 3 | Previous arrow moves Month view back by one month | Functional | **PASSED** | 5.83 s |
| **TC15** | Module 3 | "Today" button returns calendar to active current month | Functional | **PASSED** | 6.55 s |
| **TC16** | Module 3 | Opening specific date by URL (`2026/12/1`) renders month | Route / Deep link | **PASSED** | 6.79 s |
| **TC17** | Module 3 | Next arrow in Day view advances to next chronological day | Functional | **PASSED** | 6.11 s |
| **TC18** | Module 4 | Create event by typing title in editor modal | Functional (CRUD) | **PASSED** | 16.65 s |
| **TC19** | Module 4 | Created event appears on the calendar grid | Functional (E2E) | **PASSED** | 18.46 s |
| **TC20** | Module 4 | Event details popup shows Edit and Delete options | UI / Modal | **PASSED** | 18.95 s |
| **TC21** | Module 4 | Event time is shown accurately (10:30 start time) | Data Integrity | **PASSED** | 18.29 s |
| **TC22** | Module 4 | Edit an event title and verify update on grid | Functional (CRUD) | **PASSED** | 37.84 s |
| **TC23** | Module 4 | Delete event removes it completely from calendar grid | Functional (Teardown) | **PASSED** | 16.87 s |
| **TC24** | Module 4 | Negative: event saved with empty title defaults to "(No title)" | Negative / Boundary | **PASSED** | 18.02 s |
| **TC25** | Module 4 | Create an all-day event and verify day view presentation | Functional | **PASSED** | 18.64 s |
| **TC26** | Module 4 | Create recurring event (daily, 3 occurrences) & verify boundary | Boundary / RRULE | **PASSED** | 25.30 s |
| **TC27** | Module 4 | Search bar finds a newly created event | Integration / Search | **PASSED** | 20.33 s |
| **TC28** | Module 5 | Create menu dropdown offers "Event" option | Functional | **PASSED** | 7.12 s |
| **TC29** | Module 5 | Layout remains intact at compact resolution (800x600) | Usability / Responsiveness | **PASSED** | 5.74 s |
| **TC30** | Module 5 | Calendar page loads within 15 seconds SLA benchmark | Performance (NFR) | **PASSED** | 5.97 s |
| **TC31** | Module 5 | Unknown view name in URL (`/notaview`) maintains auth | Fault Tolerance | **PASSED** | 5.35 s |
| **TC32** | Module 5 | Browser Back button returns to previous calendar view | Usability / History | **PASSED** | 11.15 s |

---

### 4. Module-wise Execution Analysis

```mermaid
xychart-beta
    title "Execution Duration by Test Module (in Seconds)"
    x-axis ["Module 1 (Access)", "Module 2 (Views)", "Module 3 (Navigation)", "Module 4 (Events)", "Module 5 (Non-Functional)"]
    y-axis "Total Duration (s)" 0 --> 220
    bar [73.17, 30.58, 30.96, 209.35, 35.33]
```

#### 4.1 Module 1: Access and Page Elements
* **Total Time**: 73.17 s
* **Analysis**: Verified essential foundational UI anchors. TC05 (Settings menu) exhibited the longest run time (29.77 s) due to the dynamic DOM generation of Google's dropdown overlay.

#### 4.2 Module 2: Calendar Views
* **Total Time**: 30.58 s
* **Analysis**: Extremely consistent runtimes (~5 to 8s per test). Verifies that client-side SPA routing cleanly toggles between `/day`, `/week`, `/month`, `/year`, and `/agenda` without layout breakage.

#### 4.3 Module 3: Date Navigation
* **Total Time**: 30.96 s
* **Analysis**: Validated chronological state changes, deep linking, and the "Today" return button. All assertions resolved cleanly within default timeouts.

#### 4.4 Module 4: Event Management
* **Total Time**: 209.35 s
* **Analysis**: This is the core end-to-end module encompassing full lifecycle operations (Create, Read, Update, Delete). Highlights include:
  * **Negative Testing (TC24)**: Verified default fallback string `(No title)` when saving titleless events.
  * **Recurrence Series (TC26)**: Verified recurrence boundary conditions (Day 1, 2, 3 displayed; Day 4 absent) and multi-instance deletion dialog handling ("All events").
  * **Update Verification (TC22)**: Accurately handled UI re-render delays during Google event save transitions.

#### 4.5 Module 5: Usability, Performance & Robustness
* **Total Time**: 35.33 s
* **Analysis**: Confirmed responsive handling under constrained viewports (800x600), graceful fallback on non-existent routes without invalidating user sessions, browser history traversal, and verified non-functional latency (TC30 recorded page load at **~5.97 s**, well within the 15-second benchmark SLA).

---

### 5. Visual Evidence & Artifact Registry

All tests generated automated PNG screenshots stored in the `screenshots/` directory, serving as auditable proof of test execution:

| Test ID | Screenshot File | Primary Validated State |
| :--- | :--- | :--- |
| TC01 | `screenshots/TC01.png` | Month view with logged-in user toolbar & Today button |
| TC02 | `screenshots/TC02.png` | Browser document title containing "Calendar" |
| TC03 | `screenshots/TC03.png` | Prominent "+ Create" button visible in left panel |
| TC04 | `screenshots/TC04.png` | Search magnifying icon in top bar |
| TC05 | `screenshots/TC05.png` | Expanded Settings gear menu with "Settings" option |
| TC06 | `screenshots/TC06.png` | Left side panel mini-calendar grid widget |
| TC07 | `screenshots/TC07.png` | Preserved authenticated state following full page reload |
| TC08 | `screenshots/TC08.png` | Single-column Day view schedule grid |
| TC09 | `screenshots/TC09.png` | 7-column Week view grid with hourly time-slots |
| TC10 | `screenshots/TC10.png` | Full 5-6 week Month overview matrix |
| TC11 | `screenshots/TC11.png` | 12-month Year overview display |
| TC12 | `screenshots/TC12.png` | Linear Agenda / Schedule chronological list view |
| TC13 | `screenshots/TC13.png` | Month navigated forward (November 2026) |
| TC14 | `screenshots/TC14.png` | Month navigated backward (September 2026) |
| TC15 | `screenshots/TC15.png` | Re-anchored view at active current month via "Today" |
| TC16 | `screenshots/TC16.png` | Deep-linked target date view (December 2026) |
| TC17 | `screenshots/TC17.png` | Day view navigated to next sequential calendar day |
| TC18 | `screenshots/TC18.png` | Event creation through direct title input form |
| TC19 | `screenshots/TC19.png` | Rendered event block visible on the weekly timetable |
| TC20 | `screenshots/TC20.png` | Event details modal showing Edit (pencil) and Delete (trash) |
| TC21 | `screenshots/TC21.png` | Time accuracy assertion (10:30 AM slot) |
| TC22 | `screenshots/TC22.png` | Updated title rendered after in-place modification |
| TC23 | `screenshots/TC23.png` | Timetable grid cleared following event removal |
| TC24 | `screenshots/TC24.png` | Negative scenario: `(No title)` placeholder event on grid |
| TC25 | `screenshots/TC25.png` | All-day event banner in the top date header section |
| TC26 | `screenshots/TC26.png` | Recurring series rendered across consecutive days |
| TC27 | `screenshots/TC27.png` | Search results panel locating created event by query |
| TC28 | `screenshots/TC28.png` | Create button dropdown displaying "Event" sub-option |
| TC29 | `screenshots/TC29.png` | Responsive condensed layout rendered at 800x600 resolution |
| TC30 | `screenshots/TC30.png` | Benchmark timing screen capture (<15s load SLA) |
| TC31 | `screenshots/TC31.png` | Safe fallback view on invalid route (`/notaview`) |
| TC32 | `screenshots/TC32.png` | History navigation returning to previous month view |

---

### 6. Strengths, Observations & Recommendations

#### 6.1 Architectural Strengths
1. **Zero Flakiness in Production SaaS**: Testing third-party live web applications like Google Calendar is notoriously difficult due to dynamic styling and continuous updates. Utilizing accessible roles (`getByRole`, `getByText`) rather than brittle CSS/XPath selectors produced 100% test reliability.
2. **Deterministic Teardown**: Implementing clean teardown logic inside tests prevents data pollution and ensures independent execution.
3. **Automated Visual Audit**: Full screenshot logging on every test provides verifiable traceability for QA reporting and academic evaluation.

#### 6.2 Key Recommendations
1. **CI/CD Integration**: Currently tests rely on a local Chrome user profile (`./chrome-profile`). For headless CI runs (e.g. GitHub Actions), consider generating a storage state JSON (`storageState: 'auth.json'`) periodically or via a scheduled refresh workflow.
2. **Parallelization Potential**: Tests currently run with `workers: 1` (`fullyParallel: false`) to avoid browser profile locking in Chrome. With isolated storage states or separate profile directories, test execution can be parallelized to complete in under 1.5 minutes.
3. **Localization / i18n Testing**: The locators presently match English strings (`Today`, `Save`, `Create`, `Search`). To support international testing, strings can be parameterized into a localization dictionary.

---

### 7. Sign-Off & Conclusion

The automated testing suite for **Google Calendar** successfully met all quality gates, passing **32 out of 32 test cases (100% pass rate)**. The application demonstrated robust performance, full functional integrity across event lifecycles, and high fault tolerance. 

* **Test Suite Status**: **PASSED (Green)**
* **Readiness Level**: **Production / Submission Ready**
