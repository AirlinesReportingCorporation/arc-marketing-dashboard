const { schedule } = require("@netlify/functions");
const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");
const { Octokit } = require("@octokit/rest");

const url =
  "https://skift.com/?sort=date&s=%22airlines+reporting+corporation%22&site=&g-recaptcha-response=03AL8dmw_A4efsCN61vtvAnPQW3mXrKjtwckZba6kzHBOCaBBGFgk4e8rHqUla8ajtCPeG-9Bfg7yk64PkgNY9gYcRLOMvp4EgfUe0PtpXTFIBBE5atznnqrk0WeknYcTFDdH9hJRX56ebv3-iqGiRJOxgxcRaDRfdAqUjZLqZ-jBMNeaQ55SlxyQlqupLs02M4ughOFiwlRKAAjb3PR9GEbb1zcywZn99e2bj0onK5Zq9QNtCv6UfLYivAyk5eUOkPpS2gttv4Ux-8zhQA3b8QCb34_jyk3bDbzmgrIdor5c6oTweymvHyny0ngMdlhLoSkCFzQM8aLhK0TIX7RKNo9Pp29GxEdL7nJ8xDHmsSd6RStsyAAVj8pT8IPYrbXu7BTFtBRiTcdmEuSukXTeMuhEE9HLuB0bt3fJgTvndYaoAq4XOd6h9NcZJMzB-_WH80IaL9Y3zpiZMT7_gDuYM37dW6OarhRsQpAzRrLjmNN9vPRGt5Mx2QPBkMVSaj0bYvRQMmPLJYKY_LECEhPhDaPece0fD4iuQUg";

require("dotenv").config();

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

const handler = async function (event, context) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    //commitData($);
    const results = $(".story-list .story-wrap");

    const feed = [];

    results.each((idx, el) => {
      const result = {
        title: $(el).find("h3").text(),
        url: $(el).find("a").attr("href"),
        description: $(el).find(".skift-take").text(),
      };

      feed.push(result);
    });

    commitData(feed);

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
      path: "feed.json",
    });

    const sha = result?.data?.sha;

    const { data } = await octokit.repos.createOrUpdateFileContents({
      // replace the owner and email with your own details
      owner: "AirlinesReportingCorporation",
      repo: "arc-marketing-dashboard",
      path: "feed.json",
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

//module.exports.handler = schedule("@daily", handler);

exports.handler = schedule("@daily", handler);
