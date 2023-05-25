const { schedule } = require("@netlify/functions");
const cheerio = require("cheerio");
const { Base64 } = require("js-base64");
const axios = require("axios");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");
const puppeteer = require("puppeteer");

const url =
  "https://www.travelpulse.com/Search?q=Airlines%20Reporting%20Corporation";

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const handler = async function (event, context) {
  try {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();

    await page.goto(url);

    const sort = await page.waitForSelector("#MostPopulardropdownMenuButton");
    await page.click("#MostPopulardropdownMenuButton");
    //const recentsort = await page.waitForSelector('#MostPopulardropdownMenuButton [_sort="date"]');
    //await page.click('#MostPopulardropdownMenuButton [_sort="date"]');
    

    const data = await page.$eval(".search-list-results", (element) => {
      return element.innerHTML;
    });

    const $ = cheerio.load(data);
    //commitData($);
    const results = $(".search-result-item");


    const feed = [];

    //$(results).

    results.each((idx, el) => {
      //console.log($(result).text());
      const result = {
        title: $(el).find("h2").text(),
      };

      feed.push(result);
    });

    const contentEncoded = Base64.encode(JSON.stringify(feed));

    //const contentEncoded = Base64.encode(JSON.stringify(feed));
    console.log(feed);
    //commitData(contentEncoded);

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
