// import validatedSources from "./constants";

function buildSearchURL(
  company,
  ticker,
  dateStart,
  dateEnd = null,
  baseURL = "https://www.google.com",
  locale = "en-US"
) {
  // use regex with global modifier to replace all occurences of " " with "+"
  // to be able to pass as query to url
  let query = `"${company.replace(/ /g, "+")}"+`;
  query += `"${ticker.replace(/ /g, "+")}"+stock`;
  const dateStartString = dateStart.toLocaleDateString(locale);
  let dateEndString = dateStartString;
  if (dateEnd !== null) {
    dateEndString = dateEnd.toLocaleDateString(locale);
  }
  return `${baseURL}/search?q=${query}&tbs=cdr:1,cd_min:${dateStartString},cd_max:${dateEndString},sbd:1&tbm=nws&source=lnt`;
}

async function fetchNews(url) {
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

function newsItem(heading, source, time, link) {
  this.heading = heading;
  this.source = source;
  this.time = time;
  this.link = link;
}

function extractNewsItem(tag) {
  const parentDivSpans = tag.closest("div").getElementsByTagName("span");
  const source = parentDivSpans[0].innerText;
  const heading = tag.innerText;
  const link = tag.href;
  const timePosted = parentDivSpans[2].innerText;
  return new newsItem(heading, source, timePosted, link);
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

async function getGoogleNews(company, ticker, dateStart, dateEnd = null) {
  // Makes a fetch to get the news page and returns news elements. Returns promise
  // TODO: Add ticker information
  const url = buildSearchURL(company, ticker, dateStart, dateEnd);
  console.log("URL to get", url);
  const pageHTML = await fetchNews(url);
  if (pageHTML === null) return [];
  let allNews = [];
  for (let newsCard of pageHTML.getElementsByClassName("g")) {
    const aTags = newsCard.getElementsByTagName("a");
    const newsItems = extractNewsItems(aTags);
    // TODO: concat / extend in JS
    allNews = allNews.concat(newsItems);
  }
  return allNews;
}

export default getGoogleNews;
