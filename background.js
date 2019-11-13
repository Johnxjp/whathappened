"use-strict";

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(message.company, message.dateStart, message.dateEnd);
});
