const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;

const oldEvents = require(`./data/${process.argv[2]}/results.json`);

let browser, page;

/**
 * @function main
 */
(async function main() {
  browser = await puppeteer.launch({
    args: ["--no-sandbox"]
  });

  page = await browser.newPage();

  await page.setDefaultNavigationTimeout(60000);

  await page.goto(
    `https://www.tapology.com/search?term=${process.argv[2].replace(
      "-",
      "+"
    )}}&mainSearchFilter=events`
  );

  let urls = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("table.fcLeaderboard tr > td:first-child a")
    )
      .map(event => event.getAttribute("href"))
      .filter(url => url.indexOf("cage-titans") > 0);
  });

  // console.log();
  // await browser.close();
  // process.exit(0);

  const events = await handleEvents(urls);

  console.log("Writing to JSON.");

  writeFile(
    "./data/cage-titans/upcoming.json",
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

    const eventInfo = await page.evaluate(() => {
      const title = document.querySelector("h1").innerText.trim();

      let [day, date] = document
        .querySelector(
          "#content > div.details.details_with_poster.clearfix > div.right > ul > li.header"
        )
        .innerText.trim()
        .split(" ");

      date = date.replace(/\./g, "/");

      const meta = Array.from(
        document
          .querySelector(
            "#content > div.details.details_with_poster.clearfix > div.right"
          )
          .querySelectorAll("li:not(.header)")
      )
        .map(li => li.innerText.split(":"))
        .filter(([label, value]) => {
          if (["Venue", "Location"].includes(label)) {
            return value;
          }
        })
        .reduce((acc, val) => {
          const [label, value] = val;
          return { ...acc, [label.toLowerCase()]: value };
        }, {});

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

          const billing = matchup
            .querySelector(".billing")
            .innerText.trim()
            .toLowerCase();

          let rounds = matchup.querySelector("td").lastChild.textContent.trim();
          let isPro = true;

          if (rounds.indexOf("Am") > 0) {
            rounds = "3 x 3";
            isPro = false;
          }

          let isTitle = matchup.querySelector(".fightCardWeight .title");
          isTitle = isTitle ? true : false;

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
            time,
            billing,
            isTitle,
            isPro
          };
        }
      );

      return {
        title,
        date,
        location: meta.location,
        venue: meta.venue,
        fights
      };
    });

    EVENTS.push(eventInfo);
  }

  return EVENTS;
}
