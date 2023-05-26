import React, { Component, useState, useEffect } from "react";

import * as moment from "moment";
import axios from "axios";
import SimpleBar from "simplebar-react";
import RSSParser from "rss-parser";
import { ProductJumbo, ProductText, Stickynav } from "arccorp-vars";

let Parser = require("rss-parser");
let parser = new Parser();

let HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Request-Headers": "Accept",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  "Content-Type": "application/rss+xml",
};

function App() {
  const [feed, setFeed] = useState("airlines");
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState([]);
  const [ndcData, setndcData] = useState([]);
  const [skiftData, setskiftData] = useState([]);
  const [tpData, settpData] = useState([]);
  const [dimeData, setdimeData] = useState([]);

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const response = await axios.get(
          "https://arc-marketing-dashboard.netlify.app/arcSearch.json"
        );
        const responseNdc = await axios.get(
          "https://arc-marketing-dashboard.netlify.app/ndc.json"
        );
        const responseSkift = await axios.get(
          "https://arc-marketing-dashboard.netlify.app/feed.json"
        );

        const responseTP = await axios.get(
          "https://arc-marketing-dashboard.netlify.app/travelpulse.json"
        );

        const responseDime = await axios.get(
          "https://arc-marketing-dashboard.netlify.app/dime.json"
        );

        setndcData(responseNdc.data);
        setskiftData(responseSkift.data);
        settpData(responseTP.data);
        setdimeData(responseDime.data);
        setData(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoaded(true);
      }
    };

    loadFeeds();
  }, []);

  return (
    <div className="amd-page bg-color-fog">
      <Stickynav title="Marketing Dashboard" />
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-lg-4">
            <div className="amd-card amd-card-main d-flex text-white">
              <div className="mt-4">
                <div className="amd-eyebrow type-color-teal">Tools</div>
                <h2 className="type-color-white">ARC News Scanner</h2>
                <p className="type-color-white">
                  A collection of searches and news feed related to Airlines
                  Reporting Corporation. Each feed is updated every morning at
                  8:00 am EDT.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="amd-card text-white">
              <div className="amd-eyebrow type-color-teal">
                Google News Feed
              </div>
              <h2>Latest Hits on Google</h2>
              <div className="amd-feed">
                {loaded &&
                  data.map((item) => {
                    return (
                      <>
                        <div className="">
                          <a className="amd-feed-link" href={item.url}>
                            {item.title}
                          </a>

                          <div className="mb-1">
                            <strong>{item.date}</strong>
                          </div>
                        </div>
                        <div className="mb-3">{item.description}</div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4">
            <div className="amd-card text-white">
              <div className="amd-eyebrow type-color-teal">Company Dime</div>
              <h2>ARC in Company Dime</h2>
              <div className="amd-feed">
                {loaded &&
                  dimeData.map((item) => {
                    return (
                      <>
                        <div className="">
                          <a className="amd-feed-link" href={item.url}>
                            {item.title}
                          </a>

                          <div className="mb-1">
                            <strong>{item.date}</strong>
                          </div>
                        </div>
                        <div className="mb-3">{item.description}</div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="amd-card text-white">
              <div className="amd-eyebrow type-color-teal">Skift</div>
              <h2>ARC In Skift</h2>
              <div className="amd-feed">
                {loaded &&
                  skiftData.map((item) => {
                    return (
                      <>
                        <div className="row no-gutters m-0 align-items-center">
                          <div className="col-auto">
                            <a className="amd-feed-link" href={item.url}>
                              {item.title}
                            </a>
                          </div>
                        </div>
                        <div>{item.description}</div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="amd-card text-white">
              <div className="amd-eyebrow type-color-teal">TravelPulse</div>
              <h2>ARC in TravelPulse</h2>
              <div className="amd-feed">
                {loaded &&
                  tpData.map((item) => {
                    return (
                      <>
                        <div className="">
                          <a className="amd-feed-link" href={item.url}>
                            {item.title}
                          </a>

                          <div className="mb-1">
                            <strong>{item.date}</strong>
                          </div>
                        </div>
                        <div className="mb-3">{item.description}</div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-4">
            <div className="amd-card text-white">
              <div className="amd-eyebrow type-color-teal">
                Google News Feed
              </div>
              <h2>Keyword: NDC</h2>
              <div className="amd-feed">
                {loaded &&
                  ndcData.map((item) => {
                    return (
                      <>
                        <div className="">
                          <a className="amd-feed-link" href={item.url}>
                            {item.title}
                          </a>

                          <div className="mb-1">
                            <strong>{item.date}</strong>
                          </div>
                        </div>
                        <div className="mb-3">{item.description}</div>
                      </>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
