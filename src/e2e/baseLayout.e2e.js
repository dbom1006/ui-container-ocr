const RouterConfig = require('../../config/config').default.routes;
const { uniq } = require('lodash');
const puppeteer = require('puppeteer');

const BASE_URL = `http://localhost:${process.env.PORT || 8000}`;

function formatter(routes, parentPath = '') {
  const fixedParentPath = parentPath.replace(/\/{1,}/g, '/');
  let result = [];
  routes.forEach(item => {
    if (item.path) {
      result.push(`${fixedParentPath}/${item.path}`.replace(/\/{1,}/g, '/'));
    }
    if (item.routes) {
      result = result.concat(
        formatter(item.routes, item.path ? `${fixedParentPath}/${item.path}` : parentPath),
      );
    }
  });
  return uniq(result.filter(item => !!item));
}

const { log } = console;

describe('Ant Design Pro E2E test', () => {
  it(`test pages ${BASE_URL}/booking`, async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/booking`);
    await page.waitForSelector('#root');

    const haveElement = await page.evaluate(
      () => !!document.getElementById('root'),
    );
    expect(haveElement).toBeTruthy();
    await page.close();
    browser.close();
  })
  // it('tesst', () => {
  //   expect(['admin']).toEqual(['admin']);
  // });
});
