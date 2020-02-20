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
    const info = await this.page.evaluate(() => {
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

    const matches = await this.getMatches();
    return { ...info, matches };
  }

  /**
   * @method getMatches
   */
  async getMatches() {
    await this.page.click("#fighterRecordControls > header > div.right");
    await this.page.waitForSelector(".detail.tall");

    // const am = Array.from(
    //   document.querySelectorAll(
    //     "#fighterRecord > section:nth-child(4) .result"
    //   )
    // ).map(fight => {
    //   let mainInfo = fight.querySelector(".summary .lead");
    //   mainInfo = mainInfo ? mainInfo.innerText.trim() : "";

    //   let date = fight.querySelector(".date");
    //   date = date ? date.innerText.trim() : "";

    //   let event = fight.querySelector(".notes");
    //   event = event ? event.innerText.trim() : "";

    //   let record = fight.querySelector(
    //     ".opponent > div.record > span:nth-child(1)"
    //   );
    //   record = record ? record.innerText.trim() : "";

    //   let card = fight.querySelector(".detail.tall > div:nth-child(1)");
    //   card = card ? card.innerText.trim() : "";

    //   let timeFormat = fight.querySelector(
    //     ".detail.tall > div:nth-child(2)"
    //   );
    //   timeFormat = timeFormat ? timeFormat.innerText.trim() : "";

    //   let weightClass = fight.querySelector(
    //     ".detail.tall > div:nth-child(3)"
    //   );
    //   weightClass = weightClass ? weightClass.innerText.trim() : "";

    //   return {
    //     mainInfo,
    //     event,
    //     date,
    //     record,
    //     card,
    //     timeFormat,
    //     weightClass
    //   };
    // });
    // return await this.page.evaluate(() => {
    //   return Array.from(
    //     document.querySelectorAll("#content > ul:first-of-type li")
    //   ).map(match => {
    //     const win = el => {
    //       if (!el) return "";

    //       let result = el.getAttribute("alt");

    //       switch (result) {
    //         case "Win icon green":
    //           return true;
    //         case "Lose icon red":
    //           return false;
    //         default:
    //           "";
    //       }
    //     };

    //     const hasText = (el, selector) => {
    //       const _el = el.querySelector(selector);
    //       return _el ? _el.innerText.trim() : "";
    //     };

    //     const a = hasText(match, ".fightCardFighterName.left a");

    //     const aUrl = match
    //       .querySelector(".fightCardFighterName.left a")
    //       .getAttribute("href");

    //     const b = hasText(match, ".fightCardFighterName.right a");

    //     const bUrl = match
    //       .querySelector(".fightCardFighterName.right a")
    //       .getAttribute("href");

    //     let time = hasText(match, ".fightCardResult .time");
    //     let result = hasText(match, ".fightCardResult .result");
    //     let [method, details] = result.split(",");

    //     let round;
    //     let rounds = document
    //       .querySelector(".fightCardMatchup td")
    //       .lastChild.textContent.trim();

    //     (() => {
    //       rounds =
    //         rounds.indexOf("\n") > 0
    //           ? rounds.slice(0, rounds.indexOf("\n"))
    //           : rounds;

    //       round =
    //         method === "DECISION"
    //           ? rounds.charAt(rounds.length - 1)
    //           : time.slice(time.indexOf("Round") + 6).charAt(0);

    //       time = method === "DECISION" ? "5:00" : time.split(" ")[0];
    //       time = time === "Round" ? "" : time;
    //     })();

    //     return {
    //       fighterA: {
    //         name: a,
    //         url: aUrl,
    //         win: win(document.querySelector(".fightCardFighterName.left img"))
    //       },
    //       fighterB: {
    //         name: b,
    //         url: bUrl,
    //         win: win(document.querySelector(".fightCardFighterName.right img"))
    //       },
    //       weightClass: hasText(match, ".fightCardWeight .weight"),
    //       method,
    //       round,
    //       time,
    //       timeFormat: rounds,
    //       details: !details ? "" : details.trim()
    //     };
    //   });
    // });
  }
}

module.exports = FighterProfile;
