/* global chrome*/
import React from "react";
import "./Header.css";

function closeWindow() {
  chrome.tabs.getCurrent(tab => {
    chrome.runtime.sendMessage({ action: "closeWindow", tabId: tab.id });
  });
}

export default function Header() {
  return (
    <div id="what-happened-header">
      <h1 id="what-happened-title">What Happened?</h1>
      <img
        id="close-button-icon"
        src="./icons/close.png"
        alt="close_btn"
        onClick={closeWindow}
      />
    </div>
  );
}
