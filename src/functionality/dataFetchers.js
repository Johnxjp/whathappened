/* global chrome*/
import { TwitterDataItem, NewsDataItem } from "./dataItem";

export function fetchTweets({ company, ticker, dateStart, dateEnd }) {
  const messageData = {
    action: "getTweets",
    data: {
      company: company,
      ticker: ticker,
      dateStart: dateStart,
      dateEnd: dateEnd
    }
  };
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(messageData, response => {
      if (response.success) {
        const items = response.items.map(item => new TwitterDataItem(item));
        resolve(items);
      } else {
        reject(new Error("Could not receive tweets"));
      }
    });
  });
}

function buildSearchURL(
  { company, ticker, dateStart, dateEnd = null },
  baseURL = "https://www.google.com",
  locale = "en-US"
) {
  // use regex with global modifier to replace all occurences of " " with "+"
  // to be able to pass as query to url
  let query = `intitle:"${company.replace(/ /g, "+")}"+`;
  query += `${ticker}+intext:(stock+OR+shares)`;
  const dateStartString = dateStart.toLocaleDateString(locale);
  let dateEndString = dateStartString;
  if (dateEnd !== null) {
    dateEndString = dateEnd.toLocaleDateString(locale);
  }
  return `${baseURL}/search?q=${query}&tbs=cdr:1,cd_min:${dateStartString},cd_max:${dateEndString},sbd:1&tbm=nws&source=lnt`;
}

async function fetchNewsHTML(url) {
  try {
    const response = await fetch(url);
    const pageHTML = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageHTML, "text/html");
    return doc.getElementById("search");
  } catch (err) {
    console.log(`Error retrieving page news: ${err}`);
    return null;
  }
}

function extractNewsItem(tag) {
  const parentDivSpans = tag.closest("div").getElementsByTagName("span");
  const source = parentDivSpans[0].innerText;
  const heading = tag.innerText;
  const link = tag.href;
  const timePosted = parentDivSpans[2].innerText;
  return new NewsDataItem({ heading, source, timePosted, link });
}

function extractNewsItems(aTags) {
  let newsItems = [];
  for (let tag of aTags) {
    // Checking text length and excludes processing image links which may be from
    // different sources.
    const isImgLink = tag.getElementsByTagName("img").length > 0;
    const hasTextContent = tag.innerText.length > 0;
    if (!isImgLink && hasTextContent) {
      newsItems.push(extractNewsItem(tag));
    }
  }
  return newsItems;
}

export async function fetchNews(userQuery) {
  // Makes a fetch to get the news page and returns news elements. Returns promise
  // let allNews = [];
  // if (Object.keys(userQuery).length === 0) {
  //   return allNews;
  // }
  // const url = buildSearchURL(userQuery);
  // console.log("URL to get", url);
  // const pageHTML = await fetchNewsHTML(url);
  // if (pageHTML === null) return allNews;

  // for (let newsCard of pageHTML.getElementsByClassName("g")) {
  //   const aTags = newsCard.getElementsByTagName("a");
  //   const newsItems = extractNewsItems(aTags);
  //   allNews = allNews.concat(newsItems);
  // }
  // return allNews;

  const content = require("../data/tesla_news_content.json");
  const articles = content["items"];
  return articles.map(item => new NewsDataItem(item));
}
