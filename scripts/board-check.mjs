import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: "/Users/meghanregior/Library/Caches/ms-playwright/chromium-1140/chrome-mac/Chromium.app/Contents/MacOS/Chromium" });
const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });

// 1. leaderboard page, anonymous
await page.goto("http://localhost:4123/fr/classement", { waitUntil: "networkidle" });
await page.waitForSelector('ol[aria-label] li', { timeout: 8000 });
console.log("rows:", await page.locator('ol[aria-label] li').count());
console.log("first row:", (await page.locator('ol[aria-label] li').first().innerText()).replace(/\n/g, " | "));
console.log("join form present:", await page.locator('[data-waitlist] form').count() > 0);
await page.screenshot({ path: "/tmp/board-anon.png", fullPage: false });

// 2. signup from home → modal with stage name + insta ask
await page.goto("http://localhost:4123/fr", { waitUntil: "networkidle" });
await page.fill('input[name="email"]', "verif-board@example.com");
await page.click('[data-waitlist-cta]');
await page.waitForSelector('[role="dialog"]', { timeout: 8000 });
const dlg = page.locator('[role="dialog"]');
console.log("stage line:", (await dlg.locator('[data-referral-panel] p').first().textContent()).trim());
console.log("insta ask:", await dlg.locator('#modal-insta').count() > 0);
await dlg.locator('#modal-insta').fill("@Verif.Board");
await dlg.locator('form button[type="submit"]').click();
await page.waitForTimeout(900);
console.log("insta saved text:", (await dlg.locator('form p').textContent().catch(() => null))?.trim());
console.log("board link:", await dlg.locator('a[href="/fr/classement"]').count() > 0);
await page.screenshot({ path: "/tmp/modal-with-insta.png" });

// 3. follow the link → own row highlighted (6 leads, so rank ≤ 10 → in list)
await dlg.locator('a[href="/fr/classement"]').click();
await page.waitForSelector('ol[aria-label] li', { timeout: 8000 });
await page.waitForTimeout(600); // me-fetch
console.log("you tag:", (await page.locator('ol[aria-label] li', { hasText: "toi ✦" }).count()));
console.log("panel on page:", await page.locator('[data-referral-panel]').count());
await page.screenshot({ path: "/tmp/board-me.png", fullPage: true });

// 4. EN board
await page.goto("http://localhost:4123/en/classement", { waitUntil: "networkidle" });
await page.waitForSelector('ol[aria-label] li', { timeout: 8000 });
console.log("en title:", (await page.locator("h1").textContent()).trim());
await browser.close();
