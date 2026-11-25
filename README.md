# Google Calendar End-to-End Automation Testing

![Tests](https://img.shields.io/badge/Tests-32%2F32%20Passing-brightgreen)
![Playwright](https://img.shields.io/badge/Playwright-v1.64.1-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6)

Automated end-to-end regression testing suite for the **Google Calendar Web Application** using [Playwright](https://playwright.dev/) and TypeScript.

---

## 📌 Project Overview

This project implements an end-to-end test automation framework designed to validate critical user flows, page accessibility, views, date navigation, event management lifecycles (CRUD, recurring events, negative testing), and non-functional performance within Google Calendar.

* Comprehensive test report available in [SOFTWARE_TEST_REPORT.md](SOFTWARE_TEST_REPORT.md).
* All 32 automated test cases pass with 100% reliability.
* Automated visual evidence captured for every test in the `screenshots/` directory (`TC01.png` - `TC32.png`).

---

## 🧪 Test Suite Modules (32 Test Cases)

| Module | Scope | Test Cases | Status |
| :--- | :--- | :---: | :---: |
| **Module 1** | Access & Page Elements (Header, UI controls, session reload) | TC01 – TC07 | ✅ Passed (7/7) |
| **Module 2** | Calendar Views (Day, Week, Month, Year, Agenda) | TC08 – TC12 | ✅ Passed (5/5) |
| **Module 3** | Date Navigation (Month/Day arrows, Today reset, URL deep-linking) | TC13 – TC17 | ✅ Passed (5/5) |
| **Module 4** | Event Management (CRUD, recurring series, search, titleless event) | TC18 – TC27 | ✅ Passed (10/10) |
| **Module 5** | Usability & Robustness (Create menu, 800x600 viewport, latency SLA, history) | TC28 – TC32 | ✅ Passed (5/5) |

---

## 📁 Repository Structure

```text
├── tests/
│   ├── calendar.spec.ts    # 32 End-to-end test cases across 5 modules
│   ├── fixtures.ts         # Custom Playwright fixture with persistent Chrome context
│   └── helpers.ts          # Navigation, slot arithmetic, and event CRUD helpers
├── screenshots/            # Automated test execution evidence (TC01 - TC32)
├── login.js                # One-time interactive login launcher for local session
├── playwright.config.ts    # Playwright test configuration
├── package.json            # Project dependencies & scripts
├── SOFTWARE_TEST_REPORT.md # Detailed Software Test Report (STR)
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* Google Chrome installed locally

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd "CALENDAR TESTING"
npm install
```

### 3. Authentication Setup (Local)
Because Google Calendar requires authentication and employs strict anti-bot detection, tests use a local persistent profile:
1. Run the login script:
   ```bash
   npm run login
   ```
2. In the Chrome window that opens, sign in to your Google account.
3. Once your calendar is visible, close the Chrome browser window. The session will be saved locally in `chrome-profile/` (this folder is ignored by Git and never uploaded).

### 4. Running Tests
Run all 32 tests:
```bash
npm test
```

View the HTML test report:
```bash
npm run report
```

---

## 🛡️ Security & Privacy Notice
* User session data, local profile directories (`chrome-profile/`), and sensitive cookie files (`auth.json`) are strictly excluded via `.gitignore` to prevent credential exposure.
* Tests run against dynamic future dates (`RUN` offsets) with unique timestamp titles to avoid collisions and automatically clean up after execution.

---

## 📄 License
ISC
