/**
 * FighterProfile
 */
class FighterProfile {
  constructor(page) {
    this.page = page;
  }

  /**
   * @method main
   */
  async main() {
    const profile = await this.page.evaluate(() => {
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
          url: affiliationUrl ? affiliationUrl.getAttribute("href") : ""
        },
        photo: photo ? photo.getAttribute("src") : ""
      };
    });

    const matches = await this.getMatches(profile.name);
    return { profile, matches };
  }

  /**
   * @method getMatches
   */
  async getMatches(fighterName) {
    return await this.page.evaluate(
      ({ fighterName }) => {
        const hasText = (el, selector) => {
          const _el = el.querySelector(selector);
          return _el ? _el.innerText.trim() : "";
        };

        return Array.from(
          document.querySelectorAll(".fighterFightResults .result")
        )
          .filter(match => match.getAttribute("data-result") !== "cancelled")
          .map(match => {
            const mainInfo = hasText(match, ".summary .lead");
            const date = hasText(match, ".date");
            const event = hasText(match, ".notes");
            const card = hasText(match, ".detail.tall > div:nth-child(1)");
            const timeFormat = hasText(
              match,
              ".detail.tall > div:nth-child(2)"
            );
            const weightClass = hasText(
              match,
              ".detail.tall > div:nth-child(3)"
            );
            const opponent = hasText(match, ".opponent a");

            return {
              opponent,
              mainInfo,
              event,
              date,
              card,
              timeFormat,
              weightClass
            };
          })
          .reduce((matches, match) => {
            return {
              ...matches,
              [`${fighterName} vs. ${match.opponent}`]: match
            };
          }, {});
      },
      { fighterName }
    );
  }
}

module.exports = FighterProfile;
