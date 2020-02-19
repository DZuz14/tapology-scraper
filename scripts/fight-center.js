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

    this.eventLinks = [];
    this.promotionLinks = [];

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
    this.browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true
    });

    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(60000);

    try {
      while (true) {
        const pageResults = await this.visitResultsPage();
        if (!pageResults) throw Error("No events found.");

        this.eventLinks = testMode()
          ? pageResults.events.slice(0, 1)
          : pageResults.events;

        this.promotionLinks = testMode()
          ? pageResults.promotions.slice(0, 1)
          : pageResults.promotions;

        for (const link of this.promotionLinks) {
          if (this.promotions.hasOwnProperty(link)) continue;
          const promotion = await this.getPromotion(link);
          this.promotions[link] = promotion;
        }

        // await this.getEvent();
        // await this.getFighters();

        // await this.getFighterProfiles();
        // await this.getMatches();
        // await this.getAffiliates();

        if (testMode()) await this.test();

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
      ).map(event => event.getAttribute("href"));

      if (!events.length) return null;

      const promotions = Array.from(
        document.querySelectorAll(
          "#content > div.fightcenterEvents .promotionLogo a"
        )
      ).map(promotionLink => promotionLink.getAttribute("href"));

      return {
        events,
        promotions
      };
    });
  }

  /**
   * @method getPromotion
   */
  async getPromotion(link) {
    log("\nVisiting promotion link: " + link);

    await this.page.goto(`${this.url}${link}`);
    return await new Promotion(this.page).main();
  }

  /**
   * @method test
   */
  async test() {
    await this.browser.close();

    log("\nEvent Links:");
    log(this.eventLinks);

    log("\nPromotion Links:");
    log(this.promotionLinks);

    log("\nPromotion:");
    log(this.promotions);

    // log("\nEvents:");
    // log(this.events);

    // log("\nMatches:");
    // log(this.matches);

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

// /**
//  * @method getEvent
//  */
// async getEvent() {
//   this.event = await new Event(this.page).main();
//   log("\nRecording details for event: " + this.event.name);

//   this.events = [
//     ...this.events,
//     {
//       ...this.event,
//       tapologyUrl: `${this.url}${this.eventUrl}`
//     }
//   ];

//   log("Event details recorded successfully.");
// }

// /**
//  * @method getMatches
//  */
// async getMatches() {
//   log("\nRecording match results.");

//   const matches = await new Matches(this.page).main(this.event.name);
//   this.matches = [...this.matches, ...matches];

//   if (testMode()) this.matches = this.matches.slice(0, 1);

//   const fighterAffiliates = [];

//   for (const match of this.matches) {
//     const { fighterA, fighterB } = match;

//     log(`\nChecking profile data for ${fighterA.name} & ${fighterB.name}`);

//     for (const fighter of [fighterA, fighterB]) {
//       if (!this.fighters.hasOwnProperty(fighter.name)) {
//         log(fighter.name + " not found. Visiting profile.");

//         await this.page.goto(`${this.url}${fighter.url}`);

//         const profile = await new FighterProfile(this.page).main();
//         this.fighters[fighter.name] = profile;

//         const hasAffiliate = fighterAffiliates.filter(
//           ({ name }) => name === profile.affiliation.name
//         );

//         if (!hasAffiliate.length) fighterAffiliates.push(profile.affiliation);

//         log(`${fighter.name} recorded successfully.`);
//       } else log(`${fighter.name} found. Skipping profile.`);
//     }
//   }

//   log("\nAll matches recorded.");

//   return fighterAffiliates;
// }

// /**
//  * @method getAffiliates
//  */
// async getAffiliates(affiliates) {
//   log("\nChecking affiliates.");

//   for (const affiliate of affiliates) {
//     const { name, url } = affiliate;
//     console.log(name, url);
//   }
// }
