const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;
const eventResultsJson = require("./data/ufc/results.json");

let browser, page;

/**
 * @function main
 */
(async function main() {
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  page = await browser.newPage();

  console.log("Grabbing events from page...");

  await page.goto("http://ufcstats.com/statistics/events/completed?page=all");

  let urls = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("tbody a"))
      .slice(1)
      .map(a => a.getAttribute("href"));
  });

  if (urls.length - 1 === eventResultsJson.length) {
    console.log("No new events found.");
    await browser.close();
    process.exit(0);
  }

  urls = urls.slice(0, urls.length - 1 - eventResultsJson.length);

  const events = await handleEvents(urls);

  console.log("Writing to JSON.");

  writeFile(
    "./data/ufc/results.json",
    JSON.stringify([...events, ...eventResultsJson]),
    async () => {
      await browser.close();
      console.log("Done!");
      process.exit(0);
    }
  );
})();

/**
 * @function handleEvents
 */
async function handleEvents(events) {
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

    console.log(eventInfo.title);

    const FIGHTS = [];

    for (const fight of eventInfo.fights) {
      await page.goto(fight);

      const details = await page.evaluate(() => {
        const fighters = Array.from(
          document.querySelectorAll(
            ".b-fight-details__persons .b-fight-details__person"
          )
        )
          .map(fighter => {
            const result = fighter.querySelector("i").innerText;
            const name = fighter.querySelector("div > h3").innerText;

            return {
              result,
              name
            };
          })
          .reduce((acc, val) => {
            return {
              ...acc,
              [val.name]: {
                name: val.name,
                winLoss: val.result.toLowerCase()
              }
            };
          }, {});

        /**
         * @function removeLabel
         */
        const removeLabel = text => {
          const colonIndex = text.indexOf(":");

          if (colonIndex <= 0) {
            return text;
          }

          return text.slice(colonIndex + 1).trim();
        };

        let weightClass = removeLabel(
          document.querySelector(
            "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__fight-head > i"
          ).innerText
        );

        weightClass = weightClass
          .slice(0, weightClass.indexOf("BOUT"))
          .trim()
          .toLowerCase();

        const method = removeLabel(
          document.querySelector(
            "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__content > p:nth-child(1) > i.b-fight-details__text-item_first"
          ).innerText
        );

        const round = removeLabel(
          document.querySelector(
            "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__content > p:nth-child(1) > i:nth-child(2)"
          ).innerText
        );

        const time = removeLabel(
          document.querySelector(
            "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__content > p:nth-child(1) > i:nth-child(3)"
          ).innerText
        );

        const timeFormat = removeLabel(
          document.querySelector(
            "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__content > p:nth-child(1) > i:nth-child(4)"
          ).innerText
        );

        const ref = removeLabel(
          document.querySelector(
            "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__content > p:nth-child(1) > i:nth-child(5)"
          ).innerText
        );

        let details = document.querySelector(
          "body > section > div > div > div.b-fight-details__fight > div.b-fight-details__content > p:nth-child(2)"
        );

        if (details.childElementCount >= 3) {
          details = Array.from(
            details.querySelectorAll("i:not(.b-fight-details__text-item_first)")
          )
            .slice(1)
            .reduce((acc, val) => (acc += val.innerText.trim()), "");
        } else {
          details = removeLabel(details.innerText);
        }

        return {
          fighters,
          weightClass,
          method,
          round,
          time,
          timeFormat,
          ref,
          details
        };
      });

      FIGHTS.push(details);
    }

    EVENTS.push({ ...eventInfo, fights: FIGHTS });
  }

  return EVENTS;
}
