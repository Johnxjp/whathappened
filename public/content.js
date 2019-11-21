/* global chrome */

function renderIframe() {
  console.log("Rendering iframe");
  var iframe = document.createElement("iframe");
  iframe.id = "what-happened-iframe";
  iframe.src = chrome.extension.getURL("index.html");
  document.body.append(iframe);
}

function isGoogleStockPage() {
  const idName = "knowledge-finance-wholepage__entity-summary";
  return document.getElementById(idName) !== null;
}

function toggle() {}

if (isGoogleStockPage()) {
  console.log("Google Stock page");
  renderIframe();
}

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   console.log(message.company, message.dateStart, message.dateEnd);
//   // Dates have been serialised. Convert dates back to objects
//   const dateStart = new Date(message.dateStart);
//   const dateEnd = message.dateEnd === null ? null : new Date(message.dateEnd);
//   getGoogleNews(message.company, dateStart, dateEnd);
// });
