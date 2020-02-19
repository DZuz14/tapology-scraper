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
  async main() {
    return await this.page.evaluate(() => {
      const poster = document
        .querySelector(
          "#content > div.details.details_with_poster.clearfix > div.left > img"
        )
        .getAttribute("src");

      let [day, date] = document
        .querySelector(
          "#content > div.details.details_with_poster.clearfix > div.right > ul > li.header"
        )
        .innerText.trim()
        .split(" ");

      const { location, venue } = Array.from(
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

      const locationInfo = location.split(",");

      return {
        name: document.querySelector("h1").innerText.trim(),
        date: date.replace(/\./g, "/"),
        location: locationInfo[0].trim(),
        state: locationInfo[1].trim(),
        venue,
        poster
      };
    });
  }
}

module.exports = Event;
