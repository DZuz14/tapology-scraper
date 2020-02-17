/**
 * Event
 */
class Event {
  constructor(page) {
    this.page = page;
  }

  /**
   * @method main
   */
  async main(event) {
    await this.page.goto(`https://www.tapology.com${event}`);

    // Event Information
    const eventInfo = await this.page.evaluate(() => {
      let [day, date] = document
        .querySelector(
          "#content > div.details.details_with_poster.clearfix > div.right > ul > li.header"
        )
        .innerText.trim()
        .split(" ");

      const meta = Array.from(
        document
          .querySelector(
            "#content > div.details.details_with_poster.clearfix > div.right"
          )
          .querySelectorAll("li:not(.header)")
      )
        .map(li => li.innerText.split(":"))
        .filter(([label, value]) => {
          if (["Venue", "Location"].includes(label)) return value;
        })
        .reduce((acc, val) => {
          const [label, value] = val;
          return { ...acc, [label.toLowerCase()]: value.trim() };
        }, {});

      // Event Fights
      const fights = Array.from(
        document.querySelectorAll("ul.fightCard .fightCardBout")
      ).map(fight => {
        const winOrLoss = (el, selector) => {
          const _el = el.querySelector(selector);
          if (!_el) return "";

          let result = _el.getAttribute("alt");

          switch (result) {
            case "Win icon green":
              return "w";
            case "Lose icon red":
              return "l";
            default:
              "";
          }
        };

        const hasText = (el, selector) => {
          const _el = el.querySelector(selector);
          return selected ? _el.innerText.trim() : "";
        };

        const a = fight
          .querySelector(
            ".fightCardFighterBout.left > .fightCardFighterName.left a"
          )
          .innerText.trim();

        const b = fight
          .querySelector(
            ".fightCardFighterBout.right > .fightCardFighterName.right a"
          )
          .innerText.trim();

        let time = hasText(".fightCardResult .time");
        let result = hasText(".fightCardResult .result");
        let [method, details] = result.split(",");
        let rounds = document
          .querySelector(".fightCardMatchup td")
          .lastChild.textContent.trim();
        let round;

        (() => {
          rounds =
            rounds.indexOf("\n") > 0
              ? rounds.slice(0, rounds.indexOf("\n"))
              : rounds;

          round =
            method === "DECISION"
              ? rounds.charAt(rounds.length - 1)
              : time.slice(time.indexOf("Round") + 6).charAt(0);

          time = method === "DECISION" ? "5:00" : time.split(" ")[0];
          time = time === "Round" ? "" : time;
        })();

        return {
          fighters: {
            [a]: {
              name: a,
              winLoss: winOrLoss(".fightCardFighterName.left .resultIcon img")
            },
            [b]: {
              name: b,
              winLoss: winOrLoss(".fightCardFighterName.right .resultIcon img")
            }
          },
          weightClass: hasText(".fightCardWeight .weight"),
          method,
          round,
          time,
          timeFormat: rounds,
          details: !details ? "" : details.trim()
        };
      });

      return {
        title: document.querySelector("h1").innerText.trim(),
        date: date.replace(/\./g, "/"),
        location: meta.location,
        venue: meta.venue,
        fights
      };
    });
  }
}

module.exports = Event;
