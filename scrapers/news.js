const os = require("os");
const puppeteer = require("puppeteer");
const writeFile = require("fs").writeFile;
const Email = require("../email");
const news = require("./data/news.json");

const email = new Email();

let browser, page;

/**
 * @function main
 */
async function main() {
  browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  page = await browser.newPage();

  await page.setDefaultNavigationTimeout(60000);

  console.log("Checking news...");

  await page.goto("https://www.tapology.com/news");

  let articles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".newsItemSmall"))
      .slice(0, 20)
      .map(item => {
        const url = item
          .querySelector(".newsItemSmallTitle a")
          .getAttribute("href");

        source = url.slice(0, url.indexOf(".com"));
        source = source.slice(source.indexOf("www.") + 4);

        return {
          title: item.querySelector(".newsItemSmallTitle").innerText.trim(),
          text: item
            .querySelector(".newsItemSmallText")
            .firstChild.wholeText.trim(),
          source,
          url
        };
      });
  });

  /**
   * No new articles were found.
   */
  if (news.length && articles[0].title === news[0].title) {
    console.log("No new articles found. Exiting.");
    await browser.close();
    process.exit(0);
  }

  let sliceAt = 0;

  for (let i = 0; i < articles.length; i++) {
    if (articles[i].title === news[0].title) {
      sliceAt = i;
      break;
    }
  }

  if (sliceAt > 0) {
    articles = articles.slice(0, sliceAt);
  }

  console.log(`Number of new articles: ${articles.length}`);
  console.log("Grabbing image links for each article.");

  const newArticles = [];

  for (const article of articles) {
    try {
      console.log(article.title);

      await page.goto(article.url);

      const img = await page.evaluate(() =>
        document
          .querySelector('head meta[property="og:image"]')
          .getAttribute("content")
      );

      newArticles.push({ ...article, img });
    } catch (err) {
      if (
        err === "TimeoutError: Navigation Timeout Exceeded: 60000ms exceeded"
      ) {
        console.log("Timeout exceeded, hopping to next article...");
        continue;
      }
    }
  }

  console.log("Writing to JSON.");

  writeFile(
    "./data/news.json",
    JSON.stringify([...newArticles, ...news]),
    async () => {
      await browser.close();
      console.log("Done!");
    }
  );

  if (os.platform() === "linux") {
    writeFile(
      "/var/www/html/api/news.json",
      JSON.stringify([...newArticles, ...news]),
      async () => {
        await browser.close();
        console.log("Done!");
      }
    );
  }
}

(async () => {
  try {
    await main();
  } catch (err) {
    await browser.close();
    await email.sendError(err);
    console.log("Error encountered. Please check your e-mail. Exiting.");
    process.exit(0);
  }
})();
