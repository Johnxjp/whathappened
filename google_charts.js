function extractDate() {}

function searchNews(ticker, date) {
  // Could be in background.js? - ask question
}

function hasClickedChart() {}

function sendMessage(event) {
  console.log(`Click Detected on ${window.location.href}`);
  console.log(event);
  // chrome.runtime.sendMessage({message: "Click Event Detected"});
}

// Clicked where?
document.body.addEventListener("click", sendMessage, true);
