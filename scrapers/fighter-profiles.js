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

      let heightReach = document.querySelector("#stats > ul > li:nth-child(9)");
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

        let timeFormat = fight.querySelector(".detail.tall > div:nth-child(2)");
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
    });
  }
}

module.exports = FighterProfile;
