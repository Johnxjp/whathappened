"use-strict";

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("I've detected a browser click");
  chrome.tabs.sendMessage(tab.id, { action: `browserActionClicked` });
});

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.action === "setOnIcon") {
    chrome.browserAction.setIcon({
      path: "on_icon.png",
      tabId: sender.tab.id
    });
  }

  if (request.action === "setOffIcon") {
    chrome.browserAction.setIcon({
      path: "off_icon.png",
      tabId: sender.tab.id
    });
  }
});
