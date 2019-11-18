"use-strict";

function googleURL(
  query,
  dateStart,
  dateEnd = null,
  baseURL = "https://www.google.com",
  page = 1,
  locale = "en-US"
) {
  // Not sure how to use the page information yet
  // use regex with global modifier to replace all occurences
  query = query.replace(/ /g, "+");
  console.log("Date Start", typeof dateStart);
  const dateStartString = dateStart.toLocaleDateString(locale);

  let dateEndString = dateStartString;
  if (dateEnd !== null) {
    dateEndString = dateEnd.toLocaleDateString(locale);
  }
  return `${baseURL}/search?q=${query}&tbs=cdr:1,cd_min:${dateStartString},cd_max:${dateEndString},sbd:1&tbm=nws&source=lnt`;
}

async function getGoogleNews(company, dateStart, dateEnd = null) {
  // Makes a fetch to get the news page and returns news elements. Returns promise
  const url = googleURL(company, dateStart, dateEnd);
  console.log("URL to get", url);
  try {
    const response = await fetch(url).then(resp => resp.text());
    console.log(response);
  } catch (err) {
    console.log(err);
  }
}

function renderPopUp() {}

function closePopUp() {}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(message.company, message.dateStart, message.dateEnd);
  // Dates have been serialised. Convert dates back to objects
  const dateStart = new Date(message.dateStart);
  const dateEnd = message.dateEnd === null ? null : new Date(message.dateEnd);
  getGoogleNews(message.company, dateStart, dateEnd);
});
