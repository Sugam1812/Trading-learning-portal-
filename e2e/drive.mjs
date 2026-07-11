// End-to-end smoke drive of the exported PipQuest web build.
import { chromium } from 'playwright'; // requires a global or dev install of playwright

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8092';
const SHOT_DIR = process.env.SHOT_DIR;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

const step = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${String(e).slice(0, 250)}`);
    if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/fail-${name.replace(/\W+/g, '-')}.png` });
    process.exitCode = 1;
  }
};

const tap = async (text, exact = false) => {
  const el = page.getByText(text, { exact }).first();
  await el.waitFor({ state: 'visible', timeout: 10000 });
  await el.click();
};

await step('load app', async () => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByText('Welcome to PipQuest').waitFor({ timeout: 15000 });
});

await step('onboarding', async () => {
  await tap('I am 18 or older');
  await tap('I understand this is education, not advice');
  await tap('I understand — let’s learn');
  await page.getByLabel('Your name').fill('Test Trader');
  await tap('Continue');
  await tap('Beginner Track');
  await tap('Continue');
  await tap('Demo or live');
  await tap('Build a strategy');
  await tap('Continue');
  await tap('20 min');
  await tap('Start learning');
});

await step('home dashboard renders', async () => {
  await page.getByText('CONTINUE LEARNING').waitFor({ timeout: 10000 });
  await page.getByText('Currency Foundations').first().waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/home.png` });
});

await step('open module 0 via course map', async () => {
  // Tagline text is unique to the module card (the continue card shows the lesson objective).
  await tap('What forex is, how prices are quoted');
  await page.getByText('1. What is Forex?').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/module.png` });
});

await step('complete lesson 1 (all 5 blocks)', async () => {
  await tap('1. What is Forex?');
  await page.getByText('The biggest market you have never seen').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/lesson-concept.png` });
  await tap('Continue →');
  await tap('One currency in exchange for another');
  await page.getByText('Forex trading always exchanges one currency for another', { exact: false }).waitFor();
  await tap('Continue →');
  await tap('Continue →'); // concept block
  await tap('False', true);
  await tap('Continue →');
  await tap('Ignore it — guaranteed win rates are a red flag for a scam');
  await tap('Finish lesson 🏁');
  await page.getByText('Lesson complete!').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/lesson-complete.png` });
  await tap('Back to module');
});

await step('lesson 1 done, lesson 2 unlocked', async () => {
  await page.getByText('2. Currency Pairs').waitFor();
  await page.getByText('✅').first().waitFor();
});

await step('chart challenge flow (hidden future → commit → reveal)', async () => {
  await page.goto(BASE + '/challenge/ch-trend-1', { waitUntil: 'networkidle' });
  await page.getByText('future hidden').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/challenge.png` });
  await tap('Uptrend — higher highs and higher lows');
  await tap('Fairly sure');
  await tap('Commit & reveal the future');
  await page.getByText('Process vs. outcome').waitFor();
  await page.getByText('future revealed').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/challenge-reveal.png` });
});

await step('practice tab lists challenges', async () => {
  await page.goto(BASE + '/practice', { waitUntil: 'networkidle' });
  await page.getByText('Chart challenges').waitFor();
  await page.getByText('Call the Trend').first().waitFor();
});

await step('calculators compute correctly', async () => {
  await page.goto(BASE + '/calculators', { waitUntil: 'networkidle' });
  await page.getByText('Max planned loss').waitFor();
  await page.getByText('$10.00').waitFor(); // $1000, 1%
  await page.getByText('0.05 lots').waitFor(); // 20 pip stop
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/calculator.png` });
});

await step('strategy builder: example + rule check + save', async () => {
  await page.goto(BASE + '/strategy-builder', { waitUntil: 'networkidle' });
  await tap('Load example: London Pullback');
  await tap('Run rule check');
  await page.getByText('Rules pass the objectivity check', { exact: false }).waitFor();
  await tap('Save strategy');
  // Saving navigates back; verify it is listed in the Lab.
  await page.goto(BASE + '/lab', { waitUntil: 'networkidle' });
  await page.getByText('EUR/USD London Pullback').first().waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/lab.png` });
});

await step('backtest replay session end-to-end', async () => {
  await page.goto(BASE + '/backtest', { waitUntil: 'networkidle' });
  await page.getByText('Honesty rules (enforced)').waitFor();
  await tap('Start backtest ⏪');
  await page.getByText('Next candle →').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/backtest.png` });
  await tap('Next candle →');
  await tap('Next candle →');
  await tap('📋 Plan a trade');
  await page.getByLabel('Trade reason').fill('Uptrend continuation after pullback held');
  await tap('Place trade');
  await tap('+10 candles ⏭');
  await tap('+10 candles ⏭');
  await tap('Finish session & see results');
  await page.getByText('Honest interpretation').waitFor();
  await page.getByText('Equity curve (R)').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/backtest-results.png` });
});

await step('journal: add a trade and see analytics', async () => {
  await page.goto(BASE + '/journal-entry', { waitUntil: 'networkidle' });
  await page.getByLabel('Setup name').fill('Break & retest');
  await tap('+2R', true);
  await page.getByLabel('Why did you enter?').fill('Retest of broken resistance held');
  await tap('Save trade (+15 XP)');
  await page.goto(BASE + '/journal', { waitUntil: 'networkidle' });
  await page.getByText('Rule compliance').waitFor();
  await page.getByText('Break & retest').first().waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/journal.png` });
});

await step('profile: mastery, achievements, theme switch', async () => {
  await page.goto(BASE + '/profile', { waitUntil: 'networkidle' });
  await page.getByText('Skill mastery').waitFor();
  await page.getByText('First Steps').waitFor();
  await tap('light', true);
  await page.getByText('Achievements').waitFor();
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/profile-light.png` });
  await tap('dark', true);
});

await step('glossary search', async () => {
  await page.goto(BASE + '/glossary', { waitUntil: 'networkidle' });
  await page.getByLabel('Search terms').fill('drawdown');
  await page.getByText('The drop from your account’s peak', { exact: false }).waitFor();
});

await step('review screen shows notebook state', async () => {
  await page.goto(BASE + '/review', { waitUntil: 'networkidle' });
  // Either empty state or due items — both are valid rendered states.
  await page.getByText(/notebook|Nothing due|clean/i).first().waitFor();
});

await step('legal page', async () => {
  await page.goto(BASE + '/legal', { waitUntil: 'networkidle' });
  await page.getByText('Trading foreign exchange carries substantial risk.').waitFor();
});

await step('progress persists across full reload', async () => {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.getByText('CONTINUE LEARNING').waitFor({ timeout: 15000 });
  await page.getByText('Currency Pairs').first().waitFor(); // lesson 2 is next → lesson 1 completion persisted
  if (SHOT_DIR) await page.screenshot({ path: `${SHOT_DIR}/home-after.png` });
});

const realErrors = errors.filter((e) => !e.includes('favicon') && !e.includes('React DevTools'));
if (realErrors.length) {
  console.log('CONSOLE/PAGE ERRORS:');
  for (const e of [...new Set(realErrors)].slice(0, 10)) console.log('  ' + e.slice(0, 220));
  process.exitCode = 1;
} else {
  console.log('NO CONSOLE ERRORS');
}
await browser.close();
