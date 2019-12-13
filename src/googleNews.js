import validatedSources from "./constants";

function googleURL(
  company,
  ticker,
  dateStart,
  dateEnd = null,
  baseURL = "https://www.google.com",
  page = 1,
  locale = "en-US"
) {
  // Not sure how to use the page information yet
  // use regex with global modifier to replace all occurences of " " with "+"
  // to be able to pass as query to url
  let query = `"${company.replace(/ /g, "+")}"+"${ticker.replace(
    / /g,
    "+"
  )}"+stock`;
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
    let parser = new DOMParser();
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

async function getGoogleNews(company, ticker, dateStart, dateEnd = null) {
  // Makes a fetch to get the news page and returns news elements. Returns promise
  // TODO: Add ticker information
  const url = googleURL(company, ticker, dateStart, dateEnd);
  console.log("URL to get", url);
  var pageHTML = await fetchNews(url);
  if (pageHTML === null) {
    return [];
  }
  var allNews = [];
  for (let newsCard of pageHTML.getElementsByClassName("g")) {
    let aTags = newsCard.getElementsByTagName("a");
    for (let tag of aTags) {
      // Checking text length and excludes processing image links which may be from
      // different sources.
      const isImgLink = tag.getElementsByTagName("img").length > 0;
      if (!isImgLink && tag.innerText.length > 0) {
        const parentDivSpans = tag.closest("div").getElementsByTagName("span");
        const source = parentDivSpans[0].innerText;
        // if (validatedSources.includes(source.toLowerCase())) {
        const heading = tag.innerText;
        const link = tag.href;
        const timePosted = parentDivSpans[2].innerText;
        allNews.push(new newsItem(heading, source, timePosted, link));
        // }
      }
    }
  }
  return allNews;
}

export default getGoogleNews;
