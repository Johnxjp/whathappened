/* global chrome */

var iframe = document.createElement("iframe");
iframe.id = "what-happened-iframe";
iframe.src = chrome.extension.getURL("index.html");

document.body.append(iframe);