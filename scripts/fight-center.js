const puppeteer = require("puppeteer");
const Event = require("../scrapers/event");
const FighterProfile = require("../scrapers/fighter-profile");

let browser, page;

(async () => {
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);
})();

(async () => {
  const url =
    "https://www.tapology.com/fightcenter?group=regional&schedule=results&sport=mma&region=2&page=";

  let count = 1;

  while (true) {
    await page.goto(`${url}${count}`);
    await page.waitForSelector(".fightcenterEvents");

    const events = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("section .fcListing span.name")
      ).map(event => event.getAttribute("href"))
    );

    if (!events.length) {
      console.log("No events were found.");
      break;
    }

    for (const event of events) {
      console.log(event);

      // Promotion
      // Event
    }

    count++;
  }
})();
