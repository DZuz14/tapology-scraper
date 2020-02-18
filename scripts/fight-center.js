const puppeteer = require("puppeteer");
const Promotion = require("../scrapers/promotion");
// const Event = require("../scrapers/event");
// const FighterProfile = require("../scrapers/fighter-profile");
const { testMode } = require("../utils");

const log = msg => {
  console.log(msg);
};

/**
 * FightCenter
 */
class FightCenter {
  constructor() {
    this.count = 1;
    this.eventUrls = [];
    this.url = "https://www.tapology.com";

    this.affiliates = {};
    this.events = {};
    this.fighters = {};
    this.matches = {};
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

      if (testMode())
        this.eventUrls = ["/fightcenter/events/65706-cage-titans-47"];
      else {
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

      for (const event of this.eventUrls) {
        log("Visiting event: " + event);
        await this.page.goto(`${this.url}${event}`);

        log("\nChecking promotion...");
        const promotionUrl = await this.page.evaluate(() =>
          document
            .querySelector(
              "#content > div.details.details_with_poster.clearfix > div.right > ul > li:nth-child(2) > span > a"
            )
            .getAttribute("href")
        );

        await this.page.goto(`${this.url}${promotionUrl}`);
        const promotionName = await Promotion.getName(this.page);

        if (!this.promotions.hasOwnProperty(promotionName)) {
          log(
            "Promotion hasn't been visited yet. \nGrabbing info for: " +
              promotionName
          );

          const promotionInfo = await new Promotion(this.page).main();
          this.promotions[promotionName] = promotionInfo;
        } else log("Promotion already visited. Moving on.");

        if (testMode()) break;

        // Event Details
        // Matches
      }

      if (testMode()) {
        await this.browser.close();

        console.log("\nPromotion:");
        console.log(this.promotions);

        console.log("\nEvents:");
        console.log(this.events);

        console.log("\nMatches:");
        console.log(this.matches);

        console.log("\nFighters:");
        console.log(this.fighters);

        console.log("\nAffiliates:");
        console.log(this.affiliates);

        process.exit(0);
      }

      this.count++;
    }
  }
}

// Run
new FightCenter().main();
