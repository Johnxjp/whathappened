"use-strict";

chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("I've detected a browser click");
  chrome.tabs.sendMessage(tab.id, { action: `browserActionClicked` });
});

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.action === "setOnIcon") {
    chrome.browserAction.setIcon({
      path: "icons/on_icon.png",
      tabId: sender.tab.id
    });
  } else if (request.action === "setOffIcon") {
    chrome.browserAction.setIcon({
      path: "icons/off_icon.png",
      tabId: sender.tab.id
    });
  } else if (request.action === "closeWindow") {
    console.log("detected close window from react");
    chrome.tabs.sendMessage(request.tabId, { action: `browserActionClicked` });
  }
});

async function getClusters(items) {
  const url = "http://0.0.0.0:5000/cluster";
  let r = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sentences: items })
  });
  r = await r.json();
  return r["clusters"];
}

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.action === "clusterNews") {
    getClusters(request.items)
      .then(clusters => response({ clustersIndices: clusters, success: true }))
      .catch(() => response({ success: false }));
  }
  return true;
});
