function extractDate() {}

function searchNews(ticker, date) {
  // Could be in background.js? - ask question
}

function hasClickedChart() {}

function sendMessage() {
  console.log(`Click Detected on ${window.location.href}`);
  // chrome.runtime.sendMessage({message: "Click Event Detected"});
}

// Clicked where?
document.body.addEventListener("click", sendMessage, true);
