const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;
const readDir = require("fs").readdir;
const rds = require("fs").readdirSync;
const unlink = require("fs").unlinkSync;
const fighterNames = require("./data/fighter-names");

let browser, page;

let errors = rds("./data/fighters/errors");

// (async () => {
//   await main(errors);
// })();

readDir("./data/fighters", (err, files) => {
  for (const file of files) {
    if (errors.includes(file.replace(".json", ""))) {
      unlink(`./data/fighters/errors/${file.replace(".json", "")}`);
    }
  }
});

/**
 * @function main
 */
async function main(files) {
  browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    devtools: true,
    headless: true
  });

  page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);

  await handleProfiles(files);

  await browser.close();
}

/**
 * @function handleProfiles
 */
async function handleProfiles(names) {
  for (const name of names) {
    console.log(name);
    try {
      await page.goto(
        `https://www.tapology.com/search?term=${name.replace(
          /\s/g,
          "+"
        )}&mainSearchFilter=fighters`
      );

      const link = await page.evaluate(() => {
        const link = document.querySelector(
          "#content > div.searchResultsFighter > table > tbody > tr:nth-child(2) > td:nth-child(1) a"
        );

        return link ? link.getAttribute("href") : null;
      });

      if (!link) {
        writeFile(`./data/fighters/errors/${name}`, " ", () => {});
        continue;
      }

      await page.goto(`https://www.tapology.com${link}`);

      await page.click("#fighterRecordControls > header > div.right");

      await page.waitForSelector(".detail.tall");

      const profile = await page.evaluate(() => {
        let nickname = document.querySelector(
          "#content > div.fighterUpcomingHeader > h4.preTitle.nickname"
        );
        nickname = nickname ? nickname.innerText.trim() : "";

        let record = document.querySelector(
          "#content > div.fighterUpcomingHeader > h1.prorecord"
        );
        record = record ? record.innerText.trim() : "";

        let age = document.querySelector("#stats > ul > li:nth-child(7)");
        age = age ? age.innerText.trim() : "";

        let heightReach = document.querySelector(
          "#stats > ul > li:nth-child(9)"
        );
        heightReach = heightReach ? heightReach.innerText.trim() : "";

        let country = document.querySelector("#stats > ul > li:nth-child(11)");
        country = country ? country.innerText.trim() : "";

        const pro = Array.from(
          document.querySelectorAll(
            "#fighterRecord > section:nth-child(3) .result"
          )
        ).map(fight => {
          let mainInfo = fight.querySelector(".summary .lead");
          mainInfo = mainInfo ? mainInfo.innerText.trim() : "";

          let date = fight.querySelector(".date");
          date = date ? date.innerText.trim() : "";

          let event = fight.querySelector(".notes");
          event = event ? event.innerText.trim() : "";

          let record = fight.querySelector(
            ".opponent > div.record > span:nth-child(1)"
          );
          record = record ? record.innerText.trim() : "";

          let card = fight.querySelector(".detail.tall > div:nth-child(1)");
          card = card ? card.innerText.trim() : "";

          let timeFormat = fight.querySelector(
            ".detail.tall > div:nth-child(2)"
          );
          timeFormat = timeFormat ? timeFormat.innerText.trim() : "";

          let weightClass = fight.querySelector(
            ".detail.tall > div:nth-child(3)"
          );
          weightClass = weightClass ? weightClass.innerText.trim() : "";

          return {
            mainInfo,
            event,
            date,
            record,
            card,
            timeFormat,
            weightClass
          };
        });

        const am = Array.from(
          document.querySelectorAll(
            "#fighterRecord > section:nth-child(4) .result"
          )
        ).map(fight => {
          let mainInfo = fight.querySelector(".summary .lead");
          mainInfo = mainInfo ? mainInfo.innerText.trim() : "";

          let date = fight.querySelector(".date");
          date = date ? date.innerText.trim() : "";

          let event = fight.querySelector(".notes");
          event = event ? event.innerText.trim() : "";

          let record = fight.querySelector(
            ".opponent > div.record > span:nth-child(1)"
          );
          record = record ? record.innerText.trim() : "";

          let card = fight.querySelector(".detail.tall > div:nth-child(1)");
          card = card ? card.innerText.trim() : "";

          let timeFormat = fight.querySelector(
            ".detail.tall > div:nth-child(2)"
          );
          timeFormat = timeFormat ? timeFormat.innerText.trim() : "";

          let weightClass = fight.querySelector(
            ".detail.tall > div:nth-child(3)"
          );
          weightClass = weightClass ? weightClass.innerText.trim() : "";

          return {
            mainInfo,
            event,
            date,
            record,
            card,
            timeFormat,
            weightClass
          };
        });

        return {
          name,
          nickname,
          age,
          heightReach,
          country,
          record,
          fights: {
            pro,
            am
          }
        };
      });

      writeFile(`./data/fighters/${name}.json`, JSON.stringify(profile), () => {
        console.log(`Done writing profile for ${name}`);
      });
    } catch (err) {
      console.log(err);
      console.log("Closing browser...");
      await browser.close();

      browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        devtools: true,
        headless: true
      });

      page = await browser.newPage();
      await page.setDefaultNavigationTimeout(60000);
      console.log("Continuing with new page instance.");
      // await page.waitFor(60000);
      continue;
      // writeFile("./error.txt", name, () => {});
      // continue;
    }
  }
}

// const names = {};

// for (const event of x) {
//   for (const fight of event.fights) {
//     for (const fighter of Object.keys(fight.fighters)) {
//       if (!names[fighter]) {
//         names[fighter] = fighter;
//       }
//     }
//   }
// }
