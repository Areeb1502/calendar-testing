   const { chromium } = require('@playwright/test');

   (async () => {
     const context = await chromium.launchPersistentContext('./chrome-profile', {
       channel: 'chrome',
       headless: false,
       ignoreDefaultArgs: ['--enable-automation'],
       args: ['--disable-blink-features=AutomationControlled'],
     });
     const page = context.pages()[0] || await context.newPage();
     await page.goto('https://calendar.google.com');
     console.log('Log in, then close the Chrome window when you see your calendar.');
     await new Promise((resolve) => context.on('close', resolve));
   })();