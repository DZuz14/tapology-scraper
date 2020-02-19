/**
 * Matches
 */
class Matches {
  constructor(page) {
    this.page = page;
  }

  /**
   * @method main
   */
  async main(event) {
    return await this.page.evaluate(
      function matches({ event }) {
        return Array.from(
          document.querySelectorAll("#content > ul:first-of-type li")
        ).map(match => {
          const win = el => {
            if (!el) return "";

            let result = el.getAttribute("alt");

            switch (result) {
              case "Win icon green":
                return true;
              case "Lose icon red":
                return false;
              default:
                "";
            }
          };

          const hasText = (el, selector) => {
            const _el = el.querySelector(selector);
            return _el ? _el.innerText.trim() : "";
          };

          const a = hasText(match, ".fightCardFighterName.left a");
          const b = hasText(match, ".fightCardFighterName.right a");

          let time = hasText(match, ".fightCardResult .time");
          let result = hasText(match, ".fightCardResult .result");

          let [method, details] = result.split(",");

          let round;
          let rounds = document
            .querySelector(".fightCardMatchup td")
            .lastChild.textContent.trim();

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
            fighterA: {
              name: a,
              win: win(document.querySelector(".fightCardFighterName.left img"))
            },
            fighterB: {
              name: b,
              win: win(
                document.querySelector(".fightCardFighterName.right img")
              )
            },
            weightClass: hasText(match, ".fightCardWeight .weight"),
            method,
            round,
            time,
            timeFormat: rounds,
            details: !details ? "" : details.trim(),
            event
          };
        });
      },
      { event }
    );
  }
}

module.exports = Matches;
