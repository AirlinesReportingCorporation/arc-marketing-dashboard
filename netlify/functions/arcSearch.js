const { schedule } = require("@netlify/functions");
const cheerio = require("cheerio");
const { Base64 } = require("js-base64");
const axios = require("axios");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const puppeteer = require("puppeteer");

const url =
  "https://www.google.com/search?q=travel+agencies&rlz=1C1CHBF_enUS919US919&biw=1920&bih=937&tbs=sbd%3A1&tbm=nws&sxsrf=APwXEddBQzzDTnep_QkJJ_INz21F5cqQtA%3A1684786856199&ei=qM5rZI_PC-Kv5NoPxqC_6AM&ved=0ahUKEwiPw9eQ4In_AhXiF1kFHUbQDz0Q4dUDCA4&uact=5&oq=travel+agencies&gs_lcp=Cgxnd3Mtd2l6LW5ld3MQAzIICAAQgAQQsQMyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQ6CwgAEIoFELEDEJECOg4IABCKBRCxAxCDARCRAjoICAAQigUQkQI6CwgAEIAEELEDEIMBOgcIABCKBRBDOg0IABCKBRCxAxCDARBDOgsIABCKBRCxAxCDAToKCAAQigUQsQMQQzoECAAQAzoKCAAQgAQQsQMQCjoHCAAQgAQQClDPBVj_EmDSE2gCcAB4AIABYYgB7QiSAQIxNpgBAKABAcABAQ&sclient=gws-wiz-news";

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const handler = async function (event, context) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    const data = await page.$eval("#search", (element) => {
      return element.innerHTML;
    });

    const $ = cheerio.load(data);
    //commitData($);
    const results = $("a");

    //console.log(results);

    const feed = [];

    //$(results).

    results.each((idx, el) => {
      //console.log($(result).text());
      const result = {
        title: $(el).find("div[role=heading]").text(),
        url: $(el).attr("href"),
        description: $(el).find("div[role=heading]").next().text(),
        date: $(el).find("span").text().split(".")[1],
        source: $(el).find("span").text().split(".")[0],
      };

      feed.push(result);
    });

    const contentEncoded = Base64.encode(JSON.stringify(feed));

    //const contentEncoded = Base64.encode(JSON.stringify(feed));

    commitData(contentEncoded);

    return {
      statusCode: 200,
      body: JSON.stringify(feed),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    };
  } catch (err) {
    console.error(err);
  }
};

async function commitData(contentEncoded) {
  try {
    var result = await octokit.repos.getContent({
      owner: "AirlinesReportingCorporation",
      repo: "arc-marketing-dashboard",
      path: "dist/arcSearch.json",
    });

    const sha = result?.data?.sha;

    const { data } = await octokit.repos.createOrUpdateFileContents({
      // replace the owner and email with your own details
      owner: "AirlinesReportingCorporation",
      repo: "arc-marketing-dashboard",
      path: "dist/arcSearch.json",
      message: "update-feed-file-" + new Date().getTime() + "-if",
      content: contentEncoded,
      committer: {
        name: `netlify-functions`,
        email: "ifajardo@arccorp.com",
      },
      sha: sha,
      author: {
        name: "Ian Fajardo",
        email: "ifajardo@arccorp.com",
      },
    });
  } catch (err) {
    console.error(err);
  }
}

exports.handler = schedule("@daily", handler);
