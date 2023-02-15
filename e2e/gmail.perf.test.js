import * as Util from '../src/helpers/util.js';

const ONE_MINUTE = 5000 * 12;

const IS_CI_ENV = process.env.CI === 'true';
console.log(process.env.CI);
if (IS_CI_ENV) {
  console.log("IN CI");
} else {
  console.log("OUT CI");
}
jest.setTimeout(ONE_MINUTE * (IS_CI_ENV ? 2 : 1));

const TEST_WAIT_TIME = Util.WAIT_TIME + (IS_CI_ENV ? 200 : 100);

async function assertWarningsWithin(numExpected, time) {
  await page.waitForSelector('.jns-highlight', {
    visible: true,
    timeout: time,
  });
  const numWarnings = await page.$$('.jns-highlight');
  await expect(numWarnings.length).toBe(numExpected);
}

//NOTE: keyboard shortcuts are enabled for this account
describe('Just Not Sorry', () => {
  beforeAll(async () => {
    await page.goto('https://gmail.com');
    await page.waitForSelector('input[type="email"]', { visible: true });
    await page.type('input[type="email"]', process.env.GMAIL_TEST_USER);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.type('input[type="password"]', process.env.GMAIL_TEST_PASSWORD);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
  });

  beforeEach(async () => {
    //compose new email
    await page.keyboard.press('c');
    await page.waitForTimeout(1000);

    //set cursor in body
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
  });

  afterEach(async () => {
    await page.keyboard.press('Escape');
  });

  afterAll(async () => {
    //go to all mail
    await page.keyboard.press('g');
    await page.keyboard.press('a');
    await page.waitForTimeout(500);

    //select all
    await page.keyboard.press('*');
    await page.keyboard.press('a');
    await page.waitForTimeout(500);

    //delete
    await page.keyboard.press('#');
    await page.waitForTimeout(500);
  });

  it('should display warnings', async () => {
    await page.keyboard.type(`I'm just not sorry.`);
    await assertWarningsWithin(2, TEST_WAIT_TIME);
  });

  it('should display warnings for long emails', async () => {
    const longText = `I'm sorry about being so sorry. I'm just not sorry about being sorry. Where is it? Does that make sense? Oh, I'm just sorry. So much sorry. Is that okay? Do you mind? Forgive me for trying to be yoda. I'm no expert, but I'm sorry about being sorry. I'm actually just sorry, very, very sorry. I kind of want to know, does this make sense? I feel that I believe honestly that this might be a stupid question.`;
    const limit = 10;
    for (let i = 0; i < limit; i++) {
      await page.keyboard.type(longText);
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(TEST_WAIT_TIME);
    }
    await assertWarningsWithin(26 * limit, TEST_WAIT_TIME * limit);
  });
});
