import * as path from 'path';
import * as Util from '../src/helpers/util.js';

const ONE_MINUTE = 5000 * 12;
jest.setTimeout(ONE_MINUTE * 3);

const TEST_WAIT_TIME = (Util.WAIT_TIME + 100) * 10;
const test_page = path.join(__dirname, '..', 'public', 'jns-test.html');

async function assertWarningsWithin(numExpected, time) {
  if (numExpected > 0) {
    await page.waitForSelector('.jns-highlight', {
      visible: true,
      timeout: time,
    });
  }
  // const numWarnings = await page.$$('.jns-warning');
  const numWarnings = await page.$$('.jns-highlight');
  //longer phrases can wrap lines and create multiple tooltips
  await expect(numWarnings.length).toBeGreaterThanOrEqual(numExpected);
}

async function assertWarningsNotVisible(expected, within) {
  // await page.waitForSelector('.jns-warning', {
  await page.waitForSelector('.jns-highlight', {
    visible: false,
    timeout: within,
  });
  // const numWarnings = await page.$$('.jns-warning');
  const numWarnings = await page.$$('.jns-highlight');
  await expect(numWarnings.length).toBeGreaterThanOrEqual(expected);
}

//NOTE: keyboard shortcuts are enabled for this account
describe('Just Not Sorry', () => {
  beforeEach(async () => {
    // await page.goto('http://localhost:9021/jns-test.html');
    await page.goto(`file://${test_page}`);
    await page.waitForTimeout(500);
    await page.click('#email');
    await assertWarningsWithin(0, TEST_WAIT_TIME);
  });

  it('should work', async () => {
    await page.keyboard.type(`just not sorry.`);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    await page.keyboard.up('Shift');
    await assertWarningsNotVisible(2);
    await page.keyboard.press('Tab');
    await assertWarningsWithin(2, TEST_WAIT_TIME);
  });

  it('should display 500 words with 200 warnings', async () => {
    const fiftyWords = `Just actually sorry. Apologize. I think I'm no expert. Yes, um, literally, very, sort of, If that's okay, um, I should feel, we believe, in my opinion, This might be a silly idea. This might be a stupid question. I may be wrong. If I'm being honest. I guess. Maybe!!!`;
    expect(fiftyWords.split(' ').length).toBe(50);

    for (let i = 0; i < 500 / 50; i++) {
      await page.keyboard.type(fiftyWords);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab', { delay: 500 });
      await page.keyboard.up('Shift');
      const numExpected = 20 * (i + 1);
      await assertWarningsNotVisible(numExpected, TEST_WAIT_TIME);

      await page.keyboard.press('Tab', { delay: 500 });
      await assertWarningsWithin(numExpected, 1000);
    }
  });

  it('should display 1000 words with 400 warnings with blur', async () => {
    const fiftyWords = `Just actually sorry. Apologize. I think I'm no expert. Yes, um, literally, very, sort of, If that's okay, um, I should feel, we believe, in my opinion, This might be a silly idea. This might be a stupid question. I may be wrong. If I'm being honest. I guess. Maybe!!!`;
    expect(fiftyWords.split(' ').length).toBe(50);

    for (let i = 0; i < 1000 / 50; i++) {
      await page.keyboard.type(fiftyWords);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab', { delay: 500 });
      await page.keyboard.up('Shift');

      const numExpected = 20 * (i + 1);
      await assertWarningsNotVisible(numExpected, TEST_WAIT_TIME);

      await page.keyboard.press('Tab', { delay: 500 });
      await assertWarningsWithin(numExpected, 1000);
    }
  });

  it('should display 1000 words with 400 warnings with delay', async () => {
    const fiftyWords = `Just actually sorry. Apologize. I think I'm no expert. Yes, um, literally, very, sort of, If that's okay, um, I should feel, we believe, in my opinion, This might be a silly idea. This might be a stupid question. I may be wrong. If I'm being honest. I guess. Maybe!!!`;
    expect(fiftyWords.split(' ').length).toBe(50);

    for (let i = 0; i < 1000 / 50; i++) {
      await page.keyboard.type(fiftyWords);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(500);
      await assertWarningsWithin(20 * (i + 1), 1000 * 4);
    }
  });
});
