/* global chrome*/
import React from "react";
import "./ViewerManager.css";

function closeWindow() {
  console.log("closing window");
  chrome.tabs.getCurrent(tab => {
    chrome.runtime.sendMessage({ action: "closeWindow", tabId: tab.id });
  });
}

function Header() {
  return (
    <div id="what-happened-header">
      <h1 id="what-happened-title">What Happened?</h1>
      <img
        id="close-button-icon"
        src="./icons/close.png"
        alt="close_button"
        onClick={closeWindow}
      />
    </div>
  );
}

export default Header;
