const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;

let browser, page;

/**
 * @function main
 */
(async function main() {
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  page = await browser.newPage();

  await page.setDefaultNavigationTimeout(60000);

  await page.goto(
    "https://www.tapology.com/search?term=bellator&mainSearchFilter=events"
  );

  const urls = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("table.fcLeaderboard tr > td:first-child a")
    ).map(event => event.getAttribute("href"));
  });

  const events = await handleEvents(urls);

  console.log("Writing to JSON.");

  writeFile(
    "./data/bellator/upcoming.json",
    JSON.stringify(events),
    async () => {
      await browser.close();
      console.log("Done!");
    }
  );
})();

/**
 * @function handleEvents
 */
async function handleEvents(urls) {
  const EVENTS = [];

  for (const event of urls) {
    await page.goto(`https://www.tapology.com${event}`);

    const [isUpcoming, eventInfo] = await page.evaluate(() => {
      const title = document.querySelector("h1").innerText.trim();

      let [day, date] = document
        .querySelector(
          "#content > div.details.details_with_poster.clearfix > div.right > ul > li.header"
        )
        .innerText.trim()
        .split(" ");

      date = date.replace(/\./g, "/");

      const _fights = document.querySelector("ul.fightCard");

      const fights = Array.from(_fights.querySelectorAll(".fightCardBout")).map(
        function fights(fight) {
          const a = fight.querySelector(
            ".fightCardFighterBout.left > .fightCardFighterName.left a"
          );
          const aName = a.innerText.trim();

          const b = fight.querySelector(
            ".fightCardFighterBout.right > .fightCardFighterName.right a"
          );
          const bName = b.innerText.trim();

          const matchup = fight.querySelector(".fightCardMatchup");

          const rounds = matchup
            .querySelector("td")
            .lastChild.textContent.trim();

          let weight = matchup.querySelector(".fightCardWeight .weight");
          weight = weight ? weight.innerText.trim() : "";

          let result = fight.querySelector(".fightCardResult .result");
          result = result ? result.innerText.trim() : "";

          let time = fight.querySelector(".fightCardResult .time");
          time = time ? time.innerText.trim() : "";

          return {
            fighters: {
              [aName]: {
                name: aName,
                winLoss: ""
              },
              [bName]: {
                name: bName,
                winLoss: ""
              }
            },
            weightClass: weight,
            timeFormat: rounds,
            method: result,
            time
          };
        }
      );

      return [
        !_fights.firstElementChild.querySelector(".fightCardResult"),
        {
          title,
          date,
          location: "",
          attendance: "",
          fights
        }
      ];
    });

    if (isUpcoming) {
      console.log(eventInfo.title);
      EVENTS.push(eventInfo);
    } else {
      break;
    }
  }

  return EVENTS;
}
