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

  // await page.goto(
  //   `https://www.tapology.com/search?term=${process.argv[2].replace(
  //     "-",
  //     "+"
  //   )}&mainSearchFilter=events`
  // );

  console.log("Grabbing events from page...");

  // const urls = await page.evaluate(
  //   ({ promotion }) => {
  //     return Array.from(
  //       document.querySelectorAll("table.fcLeaderboard tr > td:first-child a")
  //     )
  //       .map(event => event.getAttribute("href"))
  //       .filter(url => url.indexOf(promotion) > 0);
  //   },
  //   { promotion: process.argv[2] }
  // );

  const urls = [
    "/fightcenter/events/62687-cage-titans-combat-night",
    "/fightcenter/events/61697-cage-titans-combat-night"
  ];

  console.log(
    `Found ${urls.length} events. Please wait until all events are scraped!`
  );

  const events = await handleEvents(urls);

  console.log("Writing to JSON.");

  writeFile(
    `./data/${process.argv[2]}-events.json`,
    JSON.stringify(events),
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
          return { ...acc, [label.toLowerCase()]: value.trim() };
        }, {});

      const _fights = document.querySelector("ul.fightCard");

      const fights = Array.from(_fights.querySelectorAll(".fightCardBout")).map(
        function fights(fight) {
          const a = fight.querySelector(
            ".fightCardFighterBout.left > .fightCardFighterName.left a"
          );

          const aName = a.innerText.trim();

          let aWinLoss = fight.querySelector(
            ".fightCardFighterName.left .resultIcon img"
          );

          aWinLoss = aWinLoss ? aWinLoss.getAttribute("alt").trim() : "";

          if (aWinLoss.length) {
            if (aWinLoss === "Win icon green") {
              aWinLoss = "w";
            } else if (aWinLoss === "Lose icon red") {
              aWinLoss = "l";
            } else {
              aWinLoss = "tbd";
            }
          }

          const b = fight.querySelector(
            ".fightCardFighterBout.right > .fightCardFighterName.right a"
          );

          const bName = b.innerText.trim();

          let bWinLoss = fight.querySelector(
            ".fightCardFighterName.right .resultIcon img"
          );

          bWinLoss = bWinLoss ? bWinLoss.getAttribute("alt").trim() : "";

          if (bWinLoss.length) {
            if (bWinLoss === "Win icon green") {
              bWinLoss = "w";
            } else if (bWinLoss === "Lose icon red") {
              bWinLoss = "l";
            } else {
              bWinLoss = "tbd";
            }
          }

          const matchup = fight.querySelector(".fightCardMatchup");

          let rounds = matchup.querySelector("td").lastChild.textContent.trim();

          if (rounds.indexOf("\n") > 0) {
            rounds = rounds.slice(0, rounds.indexOf("\n"));
          }

          let weight = matchup.querySelector(".fightCardWeight .weight");
          weight = weight ? weight.innerText.trim() : "";

          let result = fight.querySelector(".fightCardResult .result");
          result = result ? result.innerText.trim() : "";

          let [method, details] = result.split(",");
          details = !details ? "" : details.trim();

          let time = fight.querySelector(".fightCardResult .time");
          time = time ? time.innerText.trim() : "";

          let round;

          if (method === "DECISION") {
            round = rounds.charAt(rounds.length - 1);
            time = "5:00";
          } else {
            round = time.slice(time.indexOf("Round") + 6).charAt(0);
            time = time.split(" ")[0];
          }

          // No specific time was listed
          if (time === "Round") {
            time = "";
          }

          return {
            fighters: {
              [aName]: {
                name: aName,
                winLoss: aWinLoss
              },
              [bName]: {
                name: bName,
                winLoss: bWinLoss
              }
            },
            weightClass: weight,
            method,
            round,
            time,
            timeFormat: rounds,
            details
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

    console.log(eventInfo.title);

    EVENTS.push(eventInfo);
  }

  return EVENTS;
}
