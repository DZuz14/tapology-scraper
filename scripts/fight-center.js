const fs = require("fs");
const puppeteer = require("puppeteer");
const Promotion = require("../scrapers/promotion");
const Event = require("../scrapers/event");
const FighterProfile = require("../scrapers/fighter-profile");
const Affiliation = require("../scrapers/affiliation");

const { testMode } = require("../utils");

/**
 * FightCenter
 *
 * @todo
 * - Write checks for promotions and the reversal of match keys for matches
 */
class FightCenter {
  constructor() {
    this.count = 1;
    this.url = "https://www.tapology.com";

    this.events = {};
    this.matches = {};
    this.affiliates = {};
    this.fighters = {};
    this.promotions = {};

    this.files = ["affiliates", "events", "fighters", "matches", "promotions"];
  }

  /**
   * @method main
   */
  async main() {
    this.browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true
    });

    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(60000);

    try {
      this.getFiles();

      while (true) {
        const pageResults = await this.visitResultsPage();
        if (!pageResults) throw Error("No events found.");

        this.events = { ...this.events, ...pageResults.events };
        this.promotions = { ...this.promotions, ...pageResults.promotions };

        await this.getPromotions();
        await this.getEvents();

        if (testMode()) {
          log(this.events);
          log(this.affiliates);
          throw Error("\nTesting Done.");
        }

        this.count++;
      }
    } catch (err) {
      console.log(err.message);
      await this.browser.close();
      process.exit(0);
    }
  }

  /**
   * @method visitResultsPage
   */
  async visitResultsPage() {
    log(`Visiting page ${this.count}`);

    await this.page.goto(
      `${this.url}/fightcenter?group=regional&schedule=results&sport=mma&region=2&page=${this.count}`
    );

    return await this.page.evaluate(() => {
      const events = Array.from(
        document.querySelectorAll("section.fcListing span.name a")
      )
        .map(event => event.getAttribute("href"))
        .reduce((events, event) => {
          return { ...events, [event]: null };
        }, {});

      const promotions = Array.from(
        document.querySelectorAll(
          "#content > div.fightcenterEvents .promotionLogo a"
        )
      )
        .map(promotionLink => promotionLink.getAttribute("href"))
        .reduce((promotions, promotion) => {
          return { ...promotions, [promotion]: null };
        }, {});

      return {
        events,
        promotions
      };
    });
  }

  /**
   * @method getPromotion
   */
  async getPromotions() {
    for (const link of Object.keys(this.promotions)) {
      log("\nVisiting promotion link: " + link);

      await this.page.goto(`${this.url}${link}`);
      this.promotions[link] = await new Promotion(this.page).main();

      if (testMode()) return;

      await this.page.waitFor(1500);
    }
  }

  /**
   * @method getEvents
   */
  async getEvents() {
    for (const link of Object.keys(this.events)) {
      log("\nVisiting event link: " + link);

      await this.page.goto(`${this.url}${link}`);
      this.events[link] = await new Event(this.page).main();
      await this.getProfiles();

      if (testMode()) break;
    }
  }

  /**
   * @method getProfiles
   */
  async getProfiles() {
    const profileLinks = await this.page.evaluate(() => {
      return Array.from(
        document.querySelectorAll("#content > ul:first-of-type li")
      )
        .map(match => {
          const hasText = (el, selector) => {
            const _el = el.querySelector(selector);
            return _el ? _el.innerText.trim() : "";
          };

          const a = hasText(match, ".fightCardFighterName.left a");
          const b = hasText(match, ".fightCardFighterName.right a");

          return {
            [a]: match
              .querySelector(".fightCardFighterName.left a")
              .getAttribute("href"),
            [b]: match
              .querySelector(".fightCardFighterName.right a")
              .getAttribute("href")
          };
        })
        .reduce((acc, fighters) => {
          return { ...acc, ...fighters };
        }, {});
    });

    let fighters = {};
    let matches = {};

    for (const [name, link] of Object.entries(profileLinks)) {
      await this.page.goto(`${this.url}${link}`, { waitUntil: "networkidle0" });
      await this.page.click(
        "#fighterRecordControls > header > div.right section"
      );
      await this.page.waitForSelector(".detail.tall");

      const profile = await new FighterProfile(this.page).main();

      fighters = { ...fighters, [name]: profile.profile };
      matches = { ...matches, ...profile.matches };

      if (testMode()) break;
    }

    for (const fighter of Object.keys(fighters)) {
      if (!this.fighters.hasOwnProperty(fighter))
        this.fighters[fighter] = fighters[fighter];
    }

    for (const match of Object.keys(matches)) {
      if (!this.matches.hasOwnProperty(match))
        this.matches[match] = matches[match];
    }

    await this.getAffiliates(fighters);
  }

  /**
   * @method getAffiliates
   */
  async getAffiliates(fighters) {
    for (const profile of Object.values(fighters)) {
      const { name, url } = profile.affiliation;

      if (!this.affiliates.hasOwnProperty(name)) {
        await this.page.goto(`${this.url}${url}`);
        this.affiliates[name] = await new Affiliation(this.page).main();
      }
    }
  }

  /**
   * @method getFiles
   */
  getFiles() {
    for (const file of this.files) {
      const data = fs.readFileSync(`./data/${file}.json`, { encoding: "utf8" });
      this[file] = JSON.parse(data);
    }
  }

  /**
   * @method writeFiles
   */
  writeFiles() {
    for (const file of this.files)
      fs.writeFileSync(`./data/${file}.json`, JSON.stringify(this[file]));
  }
}

// Helper to shorten the console.log length.
const log = msg => {
  console.log(msg);
};

// Run
new FightCenter().main();
