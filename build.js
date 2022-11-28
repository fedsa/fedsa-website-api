// const puppeteer = require('puppeteer')
const chromium = require('chrome-aws-lambda')
const fs = require('fs')

const init = async () => {
  const browser = await chromium.puppeteer.launch({
    args: await chromium.args,
    executablePath: await chromium.executablePath,
    headless: true,
  })

  const page = await browser.newPage();
  await page.goto("https://www.meetup.com/fedsa-community/events/");

  const resultsSelector = ".list-item";
  await page.waitForSelector(resultsSelector);

  const upcoming = await page.evaluate((resultsSelector) => {
    return [...document.querySelectorAll(resultsSelector)].map((node) => ({
      title: node.querySelector(".eventCard--link").innerText,
      image: node
        .querySelector('[aria-label="Event photo"]')
        .style.backgroundImage.toString()
        .replace(/^url\("/i, "")
        .replace(/\"\)$/i, ""),
    }));
  }, resultsSelector);

  await browser.close();
  fs.writeFileSync('./api.json', JSON.stringify({ meetup: { upcoming } }))
};

init()