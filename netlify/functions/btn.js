const { schedule } = require("@netlify/functions");
const cheerio = require("cheerio");
const { Base64 } = require("js-base64");
const axios = require("axios");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const puppeteer = require("puppeteer");

const url =
  "https://www.businesstravelnews.com/Search?q=airlines%20reporting%20corporation%20ARC";

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const handler = async function (event, context) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url);

    await page.select("#ez-sort", "date");

    await new Promise((r) => setTimeout(r, 3000));

    const data = await page.$eval(".research-results", (element) => {
      return element.innerHTML;
    });

    console.log(data);

    const $ = cheerio.load(data);
    //commitData($);
    const results = $(".ez-itemMod-item");

    //console.log(results);

    const feed = [];

    //$(results).

    results.each((idx, el) => {
      //console.log($(result).text());
      const result = {
        title: $(el).find(".ez-title").text(),
        url: "https://www.businesstravelnews.com/" + $(el).find("a").attr("href"),
        description: $(el).find(".ez-desc").text(),
        date: $(el).find(".ez-date").text(),
      };

      feed.push(result);
    });

    const contentEncoded = Base64.encode(JSON.stringify(feed));

    //const contentEncoded = Base64.encode(JSON.stringify(feed));

    //console.log(feed);
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
      path: "dist/btn.json",
    });

    const sha = result?.data?.sha;

    const { data } = await octokit.repos.createOrUpdateFileContents({
      // replace the owner and email with your own details
      owner: "AirlinesReportingCorporation",
      repo: "arc-marketing-dashboard",
      path: "dist/btn.json",
      message: "update-feed-file-" + new Date().getTime() + "-ndc-if",
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

exports.handler = schedule("58 11 * * *", handler);
