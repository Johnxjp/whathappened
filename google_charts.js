const ClickLocationEnum = {
  TIMEPERIOD: 1,
  ONCHART: 2,
  OFFCHART: 3,
  UNDEFINED: 4
};

function extractDate() {}

function searchNews(ticker, date) {
  // Could be in background.js? - ask question
}

function hasClickedChart() {}

function getClickLocation(mouseEvent) {
  // Returns an enum describing where the user clicked
  const paths = mouseEvent.path;
  if (paths.length === 0) {
    return ClickLocationEnum.UNDEFINED;
  }

  // TODO: Finish
}

function sendMessage(event) {
  console.log(`Click Detected on ${window.location.href}`);
  console.log(event);
}

document.body.addEventListener("click", sendMessage, true);

/*
CSS classes that I need:
- knowledge-finance-wholepage-chart__hover-card
- knowledge-finance-wholepage-chart__fw-uch (chart)
- knowledge-finance-wholepage-chart__hover-card-time

span vk_bk for stock ticker
- I also need a stock ticker


Hyperlink to further news
a.Q2MMlc

buttons
div.qUjgX - text content

*/
