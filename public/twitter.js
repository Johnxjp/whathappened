// Social media: Searching
// https://twitter.com/search?vertical=default&q=Tesla%20Inc%20NASDAQ%20TSLA%20%22NASDAQ%3A%20TSLA%22%20stock%20since%3A2019-08-14%20until%3A2019-09-18&l=en&src=typd
// https://twitter.com/search?q=Tesla+stock%20since%3A2019-08-14%20until%3A2019-09-18&l=en&src=typd&f=news

const BASE_URL = "https://twitter.com";
const TWEET_HEADER_CLASS = "stream-item-header";
const TWEET_FOOTER_CLASS = "stream-item-footer";
const TWEET_TEXT_CLASS = "js-tweet-text-container";

function formatDateString(dateObj) {
  // returns YYYY-MM-DD string
  return dateObj.toISOString().slice(0, 10);
}

function buildSearchURL(
  company,
  ticker,
  dateStart,
  dateEnd = null,
  lang = "en",
  verified = true,
  filter_news = false,
  min_likes = 1
) {
  // ticker currently unused for better search options
  let query = `Uber stock OR shares`.replace(/ /g, "+");
  if (dateEnd === null) {
    dateEnd = dateStart;
  }
  // Need to +1 for twitter because range is [dateStart, dateEnd)
  dateEnd.setDate(dateEnd.getDate() + 1);

  let url = `${BASE_URL}/search?q=${query}`;
  url += `+since:${formatDateString(dateStart)}`;
  url += `+until:${formatDateString(dateEnd)}`;
  url += "+-filter:replies"; // removes replies

  if (filter_news) url += "+filter:news"; // only include tweets with links to news
  if (verified) url += "+filter:verified"; // only verified accounts
  if (min_likes) url += `+min_faves:${min_likes}`; // min number of likes
  url += `&lang:${lang}`;
  url += "&src:sprv"; // does not autocorrect search
  return url;
}

async function fetchPageDOM(url) {
  try {
    const response = await fetch(url);
    const pageHTML = await response.text();
    let parser = new DOMParser();
    const doc = parser.parseFromString(pageHTML, "text/html");
    return doc;
  } catch (err) {
    console.log(`Error retrieving page news: ${err}`);
    return null;
  }
}

// function extractTweet(tweetElement) {
//   let user = "";
//   let handle = "";
//   let allText = tweetElement.textContent;
//   [user, allText] = allText.split("·");
//   [user, handle] = allText.split("@");
//   handle = "@" + handle;
//   const date = allText.match(/\w{3,4}\s\d{1,2},\s\d{4}/)[0];
//   allText = allText.slice(date.length);
//   return {
//     user: user,
//     handle: handle,
//     date: date,
//     content: allText,
//     link: extractWebLink(tweetElement)
//   };
// }

// function extractWebLink(tweetElement) {
//   // assume the final link is what we want
//   const aTags = tweetElement.getElementsByTagName("a");
//   const finalLink = aTags[aTags.length - 1].href;
//   if (finalLink.match("https://t.co") !== null) return finalLink;
//   return null;
// }

// function getTimelineArticles(pageDOM) {
//   console.log(pageDOM.getElementsByTagName("body")[0]);
//   const section = pageDOM.getElementsByTagName("section")[0];
//   console.log(section);
//   const timeline = section.querySelector(
//     "[aria-label='Timeline: Search timeline']"
//   );
//   const articles = timeline.getElementsByTagName("article");
//   return articles;
// }

function getTweetsFromStreamTimeline(pageDOM, limit = 10) {
  // Every Tweet has a header, footer, some text and a drop down menu that
  // provides a link to the tweet. Some also have content like videos,
  // links to articles etc. If we extract all <li> tags we get a list of
  // [tweet, tweet copy link, tweet embed link, tweet, .. repeating]
  const tweets = Array.from(
    pageDOM.querySelectorAll("li[data-item-type='tweet']")
  );
  const parsedTweets = tweets.slice(0, limit).map(tweet => parseTweets(tweet));
  return parsedTweets;
}

function parseTweets(tweetElement) {
  const tweetMain = tweetElement.children[0];
  console.log(tweetElement);
  const tweetURL = `${BASE_URL}/${tweetMain.getAttribute(
    "data-permalink-path"
  )}`;
  const account = tweetMain.getAttribute("data-name");
  const handle = tweetMain.getAttribute("data-screen-name");
  const tweetContent = tweetElement.querySelector("div.content").children;
  const [accountTwitterURL, date, text, sourceURL] = parseTweetContent(
    tweetContent
  );
  return {
    account,
    handle,
    accountTwitterURL,
    date,
    text,
    sourceURL,
    tweetURL
  };
}

function parseTweetContent(tweetContent) {
  const header = tweetContent[0];
  const accountURL =
    BASE_URL + header.querySelector(".account-group").getAttribute("href");
  let date = header.textContent.match(/\w{3,4} \d{1,2}/);
  date = date === null ? "" : date[0];
  let [text, sourceURL] = parseTextElement(tweetContent[1]);
  return [accountURL, date, text, sourceURL];
}

function parseTextElement(textElement) {
  const paragraph = textElement.querySelector("p");
  const aTags = paragraph.getElementsByTagName("a");
  let text = paragraph.textContent;
  let sourceURL = null;
  for (let tag of aTags) {
    if (tag.hasAttribute("data-expanded-url")) {
      sourceURL = tag.href;
    }

    if (tag.className !== "twitter-hashtag") {
      text = text.replace(tag.textContent, "");
    }
  }
  return [text.trim(), sourceURL];
}

async function getTweets({ company, ticker, dateStart, dateEnd }) {
  // Returns a list of tweet objects
  dateStart = new Date(dateStart);
  dateEnd = dateEnd === null ? null : new Date(dateEnd);
  const url = buildSearchURL(company, ticker, dateStart, dateEnd);
  console.log("twitter search url", url);
  const pageDOM = await fetchPageDOM(url);
  if (pageDOM === null) return [];
  const tweets = getTweetsFromStreamTimeline(pageDOM);
  console.log("Twitter tweets", tweets);
  return tweets;
}

chrome.runtime.onMessage.addListener((request, sender, response) => {
  console.log("Sender", sender, "Request", request);
  if (request.action === "chartClicked") {
    getTweets(request.data)
      .then(tweets => console.log(tweets))
      .catch(err => console.log(err));
  }
});
