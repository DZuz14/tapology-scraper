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
    return await this.page.evaluate(() => {
      const hasText = selector => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : "";
      };

      const name = hasText(
        "#content > div.fighterUpcomingHeader > h1:nth-child(5)"
      );

      const nickname = hasText(
        "#content > div.fighterUpcomingHeader > h4.preTitle.nickname"
      );

      const age = hasText("#stats > ul > li:nth-child(7)");
      const heightReach = hasText("#stats > ul > li:nth-child(9)");
      const country = hasText("#stats > ul > li:nth-child(11)");
      const photo = document.querySelector("#content > div.fighterImg > img");

      const affiliation = hasText("#stats > ul > li:nth-child(8) > span > a");

      /**
       * @todo
       */
      const affiliationUrl = document.querySelector(
        "#stats > ul > li:nth-child(8) > span > a"
      );

      return {
        name,
        nickname,
        age,
        heightReach,
        country,
        affiliation: {
          name: affiliation,
          url: ""
        },
        photo: photo ? photo.getAttribute("src") : ""
      };
    });
  }
}

module.exports = FighterProfile;
