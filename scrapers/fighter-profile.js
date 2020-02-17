/**
 * FighterProfile
 */
class FighterProfile {
  constructor(page) {
    this.page = page;
  }

  /**
   * @function main
   */
  async main() {
    await this.page.evaluate(() => {
      const hasText = (el, selector) => {
        const _el = el.querySelector(selector);
        return selected ? _el.innerText.trim() : "";
      };

      // const name =

      const nickname = hasText(
        "#content > div.fighterUpcomingHeader > h4.preTitle.nickname"
      );

      const record = hasText(
        "#content > div.fighterUpcomingHeader > h1.prorecord"
      );

      const age = hasText("#stats > ul > li:nth-child(7)");
      const heightReach = hasText("#stats > ul > li:nth-child(9)");
      const country = hasText("#stats > ul > li:nth-child(11)");

      // const affiliation =
    });
  }
}

module.exports = FighterProfile;
