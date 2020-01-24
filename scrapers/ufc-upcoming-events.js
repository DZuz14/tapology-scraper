const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;
const upcoming = require("../data/ufc/upcoming.json");

let browser, page;

/**
 * @function main
 */
(async function main() {
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  page = await browser.newPage();

  console.log("Getting all upcoming events...");

  await page.goto("http://ufcstats.com/statistics/events/upcoming");

  const events = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("tbody a")).map(a =>
      a.getAttribute("href")
    );
  });

  const EVENTS = [];

  for (const event of events) {
    await page.goto(event);

    const eventInfo = await page.evaluate(() => {
      const title = document.querySelector("h2").innerText;

      let [date, location, attendance] = Array.from(
        document.querySelectorAll("ul.b-list__box-list li")
      ).map(text =>
        text.innerText.slice(text.innerText.indexOf(":") + 1).trim()
      );

      return {
        title,
        date,
        location,
        attendance,
        fights: Array.from(document.querySelectorAll("tbody tr")).map(tr =>
          tr.getAttribute("data-link")
        )
      };
    });

    if (eventInfo.title === upcoming[0].title) {
      console.log("Nothing new found. Exiting.");
      await browser.close();
      process.exit(0);
    }

    console.log(eventInfo.title);

    const FIGHTS = [];

    for (const fight of eventInfo.fights) {
      await page.goto(fight);

      const [fighterA, fighterB] = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll("thead th:not(.l-page_align_left)")
        ).map(th => th.innerText);
      });

      const weightClass = await page.evaluate(() => {
        const x = document
          .querySelector(".b-fight-details__fight-title")
          .innerText.trim();

        return x.slice(0, x.indexOf("BOUT"));
      });

      const [A, B] = await page.evaluate(() => {
        const A = Array.from(
          document.querySelectorAll(
            "tbody tr.b-fight-details__table-row-preview td:nth-child(2)"
          )
        )
          .slice(0, 15)
          .map(td => td.innerText.trim());

        const B = Array.from(
          document.querySelectorAll(
            "tbody tr.b-fight-details__table-row-preview td:last-child"
          )
        )
          .slice(0, 15)
          .map(td => td.innerText.trim());

        return [A, B];
      });

      FIGHTS.push({
        [fighterA]: A,
        [fighterB]: B,
        weightClass
      });
    }

    EVENTS.push({ ...eventInfo, fights: FIGHTS });
  }

  console.log("Writing to JSON.");

  writeFile("./data/ufc/upcoming.json", JSON.stringify(EVENTS), async () => {
    console.log("Done!");
    await browser.close();
    process.exit(0);
  });
})();
