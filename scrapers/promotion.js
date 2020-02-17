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
    const promotionInfo = await this.page.evaluate(() => {
      const poster = document.querySelector(
        "#content > div.details.details_with_poster .left img"
      );

      const info = Array.from(
        document.querySelectorAll(
          "#content > div.details.details_with_poster .right li"
        )
      ).reduce((acc, li) => {
        const key = li
          .querySelector("strong")
          .innerText.trim()
          .replace(":", "")
          .toLowerCase();

        let val;

        if (key === "promotion links") {
          const links = Array.from(
            key.querySelectorAll(".externalIconsHolder a")
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
        poster,
        info
      };
    });

    return promotionInfo;
  }
}

module.exports = Promotion;
