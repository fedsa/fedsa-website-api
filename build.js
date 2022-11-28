
const puppeteer = require('puppeteer')
// const chromium = require('chrome-aws-lambda')
const fs = require('fs')

const headless = puppeteer.launch({
  // args: await chromium.args,
  // executablePath: await chromium.executablePath,
  // headless: true,
})

const getLanding = async () => {
  const browser = await headless
  const page = await browser.newPage();
  await page.goto("https://www.meetup.com/fedsa-community/");

  const resultsSelector = "#members span"
  await page.waitForSelector(resultsSelector);

  const members = await page.evaluate((resultsSelector) => {
    return parseInt(document.querySelector(resultsSelector).innerText.replace(/^Members\s\(/i, '').replace(/\)$/i, '').replace(/,/ig, ''))
  }, resultsSelector)

  return {
    members
  }
}

const getMeetups = async () => {
  const browser = await headless
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

  return {
    events: {
      upcoming,
    }
  }
}


const init = async () => {
  const promises = await Promise.all([getLanding(), getMeetups()])
  const [{ members }, { events }] = promises

  const response = {
    members,
    events
  }

  fs.writeFileSync('./api.json', JSON.stringify(response, null, 2))

  const browser = await headless
  await browser.close();
};

init()