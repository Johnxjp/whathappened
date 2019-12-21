"use-strict";

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("I've detected a browser click");
  chrome.tabs.sendMessage(tab.id, { action: `browserActionClicked` });
});
