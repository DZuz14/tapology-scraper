/**
 * Promotion
 */
class Promotion {
  constructor(page) {
    this.page = page;
  }

  /**
   * @method main
   */
  async main() {
    return await this.page.evaluate(() => {
      const logo = document
        .querySelector("#content > div.details.details_with_poster .left img")
        .getAttribute("src");

      const info = Array.from(
        document.querySelectorAll(
          "#content > div.details.details_with_poster .right li"
        )
      ).reduce((acc, li) => {
        let key = li
          .querySelector("strong")
          .innerText.trim()
          .replace(":", "")
          .toLowerCase();

        let val;

        if (key === "promotion links") {
          val = Array.from(
            document.querySelectorAll(".externalIconsHolder a")
          ).reduce((acc, link) => {
            let linkType = link
              .getAttribute("onclick")
              .split(",")
              .pop();
            linkType = linkType
              .slice(linkType.indexOf("_") + 1, linkType.lastIndexOf(`'`))
              .toLowerCase();
            return ["facebook", "twitter", "website", "instagram"].includes(
              linkType
            )
              ? { ...acc, [linkType]: link.getAttribute("href") }
              : acc;
          }, {});
        } else {
          val = li.querySelector("span").innerText.trim();
          val = key === "acronyms" ? val.split(",")[0] : val;
        }

        return { ...acc, [key]: val };
      }, {});

      return {
        ...info,
        logo
      };
    });
  }
}

module.exports = Promotion;
