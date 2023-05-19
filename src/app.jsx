import React, { Component, useState, useEffect } from "react";

import * as moment from "moment";
import axios from "axios";
import SimpleBar from "simplebar-react";
import RSSParser from "rss-parser";

let Parser = require('rss-parser');
let parser = new Parser();

let HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Request-Headers": "Accept",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  "Content-Type": "application/rss+xml",
};

function App() {
  const [feed, setFeed] = useState("airlines"); 

  useEffect(() => {
    let parser = new RSSParser(HEADERS);
    let parser2 = new RSSParser(HEADERS);

    const feed = parser.parseURL(
      "https://arc-functions.netlify.app/podcast.xml",
      function(err, feed) {
        if (err) throw err;
        //console.log(feed);
        setFeed(feed);
        console.log(feed);
        //e.setState({ currentItem: e.state.feed.items[0] });
      }
    );

    const fetchPosts = async () => {
      const url = 'https://zapier.com/engine/rss/15372862/arc-mktg'
      const feed = await parser.parseURL(url)
      console.log(feed);
    }
    fetchPosts();

  }, []);

  return <div>hello</div>;
}

export default App;
