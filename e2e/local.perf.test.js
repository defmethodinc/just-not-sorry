import * as path from 'path';
import * as Util from '../src/helpers/util.js';
const ONE_MINUTE = 5000 * 12;
jest.setTimeout(ONE_MINUTE * 3);

const TEST_WAIT_TIME = Util.WAIT_TIME + 100;
const test_page = path.join(__dirname, '..', 'public', 'jns-test.html');

async function assertWarningsWithin(numExpected, time) {
  if (numExpected > 0) {
    await page.waitForSelector('.jns-highlight', {
      visible: true,
      timeout: time,
    });
  }
  const numWarnings = await page.$$('.jns-warning');
  await expect(numWarnings.length).toBe(numExpected);
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

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('1000 words with 400 warnings displays within 1 second', async () => {
    const fiftyWords = `Just actually sorry. Apologize. I think I'm no expert. Yes, um, literally, very, sort of, If that's okay, um, I should feel, we believe, in my opinion, This might be a silly idea. This might be a stupid question. I may be wrong. If I'm being honest. I guess. Maybe!!!`;
    expect(fiftyWords.split(' ').length).toBe(50);

    for (let i = 0; i < 1000 / 50; i++) {
      await page.keyboard.type(fiftyWords);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      await page.keyboard.press('Tab');
    }

    await assertWarningsWithin(400, 1000);
  });

  it.skip('should display 1000 words with 400 warnings', async () => {
    const fiftyWords = `Just actually sorry. Apologize. I think I'm no expert. Yes, um, literally, very, sort of, If that's okay, um, I should feel, we believe, in my opinion, This might be a silly idea. This might be a stupid question. I may be wrong. If I'm being honest. I guess. Maybe!!!`;
    expect(fiftyWords.split(' ').length).toBe(50);

    for (let i = 0; i < 1000 / 50; i++) {
      await page.keyboard.type(fiftyWords);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      await assertWarningsWithin(0, TEST_WAIT_TIME * 10);

      await page.keyboard.press('Tab');
      await assertWarningsWithin(20 * (i + 1), 1000 * 20);
    }
  });

  it('should display 500 words with 200 warnings', async () => {
    const fiftyWords = `Just actually sorry. Apologize. I think I'm no expert. Yes, um, literally, very, sort of, If that's okay, um, I should feel, we believe, in my opinion, This might be a silly idea. This might be a stupid question. I may be wrong. If I'm being honest. I guess. Maybe!!!`;
    expect(fiftyWords.split(' ').length).toBe(50);

    for (let i = 0; i < 500 / 50; i++) {
      await page.keyboard.type(fiftyWords);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');

      await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      await page.keyboard.up('Shift');
      await assertWarningsWithin(0, TEST_WAIT_TIME);

      await page.keyboard.press('Tab');
      await assertWarningsWithin(20 * (i + 1), 1000 * 3);
    }
  });
});
