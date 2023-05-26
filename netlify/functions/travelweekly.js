const { schedule } = require("@netlify/functions");
const cheerio = require("cheerio");
const { Base64 } = require("js-base64");
const axios = require("axios");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const url = "https://www.travelweekly.com/Search?q=airlines%20reporting%20corporation%20ARC"

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const handler = async function (event, context) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    //commitData($);
    const results = $(".ez-itemMod-item");

    const feed = [];

    results.each((idx, el) => {
      const result = {
        title: $(el).find("a").text(),
        url: $(el).find("a").attr("href"),
        description: $(el).find("p sep").text(),
        date: $(el).find(".ez-date").text().split("by")[0]
      };

      feed.push(result);
    });

    const contentEncoded = Base64.encode(JSON.stringify(feed));
    
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
      path: "dist/travelweekly.json",
    });

    const sha = result?.data?.sha;

    const { data } = await octokit.repos.createOrUpdateFileContents({
      // replace the owner and email with your own details
      owner: "AirlinesReportingCorporation",
      repo: "arc-marketing-dashboard",
      path: "dist/travelweekly.json",
      message: "update-feed-file-" + new Date().getTime() + "-travelweekly-if",
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
