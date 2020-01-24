const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;

const hasPhotos = {
  "Jay Perrin": false
};

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
    `https://www.tapology.com/fightcenter/events/63416-cage-titans-46`
  );

  // console.log();
  // await browser.close();
  // process.exit(0);

  let events = await handleEvents();

  for (const event of events) {
    const updatedFights = [];

    for (const fight of event.fights) {
      let [a, b] = Object.keys(fight.fighters);

      if (b === "Jay Perrin") {
        console.log(hasPhotos[b]);
      }
    }
  }

  //   console.log("Writing to JSON.");

  //   writeFile("./data/cage-titans/46.json", JSON.stringify(events), async () => {
  //     await browser.close();
  //     console.log("Done!");
  //   });
})();

/**
 * @function handleEvents
 */
async function handleEvents() {
  const EVENTS = [];

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
        if (["Promotion", "Venue", "Location"].includes(label)) {
          return value;
        }
      });

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
              winLoss: "",
              photo: true
            },
            [bName]: {
              name: bName,
              winLoss: "",
              photo: true
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
      meta,
      fights
    };
  });

  EVENTS.push(eventInfo);

  return EVENTS;
}
