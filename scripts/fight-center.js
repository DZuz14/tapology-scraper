const puppeteer = require("puppeteer");
// const Event = require("../scrapers/event");
// const FighterProfile = require("../scrapers/fighter-profile");

/**
 * FightCenter
 */
class FightCenter {
  constructor() {
    this.url =
      "https://www.tapology.com/fightcenter?group=regional&schedule=results&sport=mma&region=2&page=";
    this.count = 1;
  }

  /**
   * @method main
   */
  async main() {
    this.browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: false
    });

    this.page = await this.browser.newPage();

    await this.page.setDefaultNavigationTimeout(60000);
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

      const events = await this.page.evaluate(() =>
        Array.from(
          document.querySelectorAll("section.fcListing span.name a")
        ).map(event => event.getAttribute("href"))
      );

      if (!events.length) {
        console.log("No events were found.");
        break;
      }

      for (const event of events) {
        // Promotion
        // Event Details
        // Matches
      }

      this.count++;
    }
  }
}

new FightCenter().main();
