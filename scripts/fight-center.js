const puppeteer = require("puppeteer");
const Promotion = require("../scrapers/promotion");
const Event = require("../scrapers/event");
const Matches = require("../scrapers/matches");
const FighterProfile = require("../scrapers/fighter-profile");
const Affiliation = require("../scrapers/affiliation");

const { testMode } = require("../utils");

/**
 * FightCenter
 */
class FightCenter {
  constructor() {
    this.count = 1;
    this.url = "https://www.tapology.com";
    this.eventUrls = ["/fightcenter/events/65706-cage-titans-47"];

    this.events = [];
    this.matches = [];

    this.affiliates = {};
    this.fighters = {};
    this.promotions = {};
  }

  /**
   * @method main
   */
  async main() {
    try {
      this.browser = await puppeteer.launch({
        args: ["--no-sandbox"],
        headless: true
      });

      this.page = await this.browser.newPage();
      await this.page.setDefaultNavigationTimeout(60000);

      await this.visitEvents();
      await this.browser.close();
    } catch (err) {
      console.log(err);
      await this.browser.close();
      process.exit(0);
    }
  }

  /**
   * @method visitEvents
   */
  async visitEvents() {
    while (true) {
      await this.page.goto(
        `${this.url}/fightcenter?group=regional&schedule=results&sport=mma&region=2&page=${this.count}`
      );

      await this.page.waitForSelector(".fightcenterEvents");

      /**
       * Grab event urls from page.
       */
      if (!testMode()) {
        this.eventUrls = await this.page.evaluate(() =>
          Array.from(
            document.querySelectorAll("section.fcListing span.name a")
          ).map(event => event.getAttribute("href"))
        );

        if (!this.eventUrls.length) {
          log("No events were found.");
          break;
        }
      }

      log(`Visiting page ${this.count}`);

      /**
       * Visit each event on the page.
       */
      for (const event of this.eventUrls) {
        log("Visiting event: " + event);

        await this.page.goto(`${this.url}${event}`);

        /**
         * We visit the promotion page and use the static method on Promotion
         * to see if the promotion name already exists in our promotion store.
         */
        // log("\nChecking promotion...");

        // const promotionUrl = await this.page.evaluate(() =>
        //   document
        //     .querySelector(
        //       "#content > div.details.details_with_poster.clearfix > div.right > ul > li:nth-child(2) > span > a"
        //     )
        //     .getAttribute("href")
        // );

        // await this.page.goto(`${this.url}${promotionUrl}`);
        // const promotionName = await Promotion.getName(this.page);

        // // Add the promotion, or skip if we already have it.
        // if (!this.promotions.hasOwnProperty(promotionName)) {
        //   log(
        //     "Promotion hasn't been visited yet. \nGrabbing info for: " +
        //       promotionName
        //   );

        //   const promotionInfo = await new Promotion(this.page).main();

        //   this.promotions[promotionName] = {
        //     ...promotionInfo,
        //     tapologyURL: `${this.url}${promotionUrl}`
        //   };
        // } else log("Promotion already visited. Moving on.");

        // await this.page.goBack();

        /**
         * Get Event Info
         */
        log("\nRecording details of the event.");

        const _event = await new Event(this.page).main();

        this.events = [
          ...this.events,
          {
            ..._event,
            tapologyUrl: `${this.url}${event}`
          }
        ];

        /**
         * Grab all matches.
         */
        log("Grabbing match results.");

        const matches = await new Matches(this.page).main(_event.name);
        this.matches = [...this.matches, ...matches];

        if (testMode()) await this.test();
      }

      this.count++;
    }
  }

  /**
   * @method test
   */
  async test() {
    await this.browser.close();

    // log("\nPromotion:");
    // log(this.promotions);

    // log("\nEvents:");
    // log(this.events);

    log("\nMatches:");
    log(this.matches);

    // log("\nFighters:");
    // log(this.fighters);

    // log("\nAffiliates:");
    // log(this.affiliates);

    process.exit(0);
  }
}

// Helper to shorten the console.log length.
const log = msg => {
  console.log(msg);
};

// Run
new FightCenter().main();
