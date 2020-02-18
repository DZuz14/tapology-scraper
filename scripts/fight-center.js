const puppeteer = require("puppeteer");
const Promotion = require("../scrapers/promotion");
// const Event = require("../scrapers/event");
// const FighterProfile = require("../scrapers/fighter-profile");
const { testMode } = require("../utils");

/**
 * FightCenter
 */
class FightCenter {
  constructor() {
    this.url =
      "https://www.tapology.com/fightcenter?group=regional&schedule=results&sport=mma&region=2&page=";
    this.count = 1;

    this.promotions = {};
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

    if (testMode()) {
      await this.test();
      await this.browser.close();
      process.exit(0);
    }

    await this.visitEvents();
    await this.browser.close();
  }

  /**
   * @method visitEvents
   */
  async visitEvents() {
    while (true) {
      await this.page.goto(`${this.url}${this.count}`);
      await this.page.waitForSelector(".fightcenterEvents");

      let events = await this.page.evaluate(() =>
        Array.from(
          document.querySelectorAll("section.fcListing span.name a")
        ).map(event => event.getAttribute("href"))
      );

      // We've visited all of the results listed. No more exist.
      if (!events.length) {
        console.log("No events were found.");
        break;
      }

      // Testing
      if (testMode()) {
        events = [];
      }

      for (const event of events) {
        ///fightcenter/events/63416-cage-titans-46
        await this.page.goto(`${this.url}${event}`);
        const promotionName = await Promotion.getName(this.page);

        if (!this.promotions.hasOwnProperty(promotionName)) {
          const promotion = new Promotion(this.page).main();
        }
        // Get promotion link
        // Event Details
        // Matches
      }

      this.count++;
    }
  }

  /**
   * @method visitPromotion
   */
  async visitPromotion() {
    //
  }

  /**
   * @method getEventDetails
   */
  async getEventDetails() {
    //
  }

  /**
   * @method getMatchDetails
   */
  async getMatchDetails() {
    //
  }

  /**
   * @method test
   */
  async test() {
    console.log("Running in test mode...");
    const scraper = process.argv[2];

    switch (scraper) {
      case "promotion":
        await this.page.goto(
          "https://www.tapology.com/fightcenter/promotions/109-fight-night-mma-fnmma"
        );

        return await new Promotion(this.page).main();
      default:
        console.log("Scraper not recognized. Exiting.");
    }
  }
}

// Run
new FightCenter().main();
