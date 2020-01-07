// TODO: Different event for mouse button down and release
// to get the dateRange

/* global chrome */

// constants
const IFRAME_ID = "what-happened-iframe-id";
const HOVER_CARD_CLASS = "knowledge-finance-wholepage-chart__hover-card";
const CHART_CLASS = "knowledge-finance-wholepage-chart__fw-uch";
const FINANCE_ELEMENT_ID = "knowledge-finance-wholepage__entity-summary";
const COMPANY_CLASS = "vk_bk";
const TICKER_CLASS = "HfMth";
const TIME_PERIOD_CLASS = "QiGJYb fw-ch-sel";

// Listeners
window.addEventListener("load", () => {
  var element = getFinancialSummaryElement();
  if (element !== null) {
    const interactor = new GoogleChartInteractor(element);
    interactor.addChartListeners();
    setOnIcon();
    renderIframe();
  } else {
    setOffIcon();
  }
});

window.addEventListener("unload", () => {
  setOffIcon();
});

class GoogleChartInteractor {
  constructor(financeElement) {
    this.financeElement = financeElement;
    this.chartHasBeenClicked = false;
    this.selectionRangeText = "";
  }

  addChartListeners() {
    this.financeElement.addEventListener("mousedown", event =>
      this.processMouseDown(event)
    );
    this.financeElement.addEventListener("mousemove", () =>
      this.processMouseMove()
    );
    this.financeElement.addEventListener("mouseup", () =>
      this.processMouseUp()
    );
  }

  processMouseDown(event) {
    this.chartHasBeenClicked = wasChartClicked(event);
    this.selectionRangeText = "";
  }

  processMouseMove() {
    if (this.chartHasBeenClicked) {
      let hoverCardElement = this.financeElement.getElementsByClassName(
        HOVER_CARD_CLASS
      )[0];
      this.selectionRangeText = hoverCardElement.textContent;
    }
  }

  processMouseUp() {
    if (this.chartHasBeenClicked && this.selectionRangeText !== "") {
      const chartInfo = extractChartInfo(
        this.financeElement,
        this.selectionRangeText
      );
      console.log(this.selectionRangeText);
      console.table(chartInfo);

      if (
        isValidSelectionRange(
          chartInfo.priceChange,
          chartInfo.dateStart,
          chartInfo.dateEnd
        )
      ) {
        sendDataToFetchNews(
          chartInfo.company,
          chartInfo.ticker,
          chartInfo.dateStart,
          chartInfo.dateEnd
        );
      }
      // Adjust Iframe so it displays invalid range for feedback
      showIframe();
    }
    this.chartHasBeenClicked = false;
  }
}

function sendDataToFetchNews(company, ticker, dateStart, dateEnd = null) {
  console.log("Sending data");
  chrome.runtime.sendMessage({
    action: "chartClicked",
    data: {
      company: company,
      ticker: ticker,
      dateStart: dateStart,
      dateEnd: dateEnd
    }
  });
}

function wasChartClicked(event) {
  // Checks if clicked on chart. Cannot attach a click listener to chart
  // directly because chart changes everytime new date is selected
  const paths = event.path;
  return paths.find(isChartElement) !== undefined;
}

function isChartElement(element) {
  // some class names are not a string so do this check first
  return (
    typeof element.className === "string" &&
    element.className.includes(CHART_CLASS)
  );
}

function isValidSelectionRange(priceChange, dateStart, dateEnd) {
  const priceHasChanged = priceChange !== 0.0;
  const startEqualsEnd = dateStart === dateEnd;
  return priceHasChanged && !startEqualsEnd;
}

function extractChartInfo(financeElement, selectionRangeText) {
  // from finance element
  const company = processName(extractCompanyName(financeElement));
  const ticker = extractTicker(financeElement);
  const timePeriod = extractTimePeriod(financeElement);
  const chartTime = getCurrentChartTime(financeElement);
  // From hover card text
  const priceChange = extractPriceChange(selectionRangeText);
  // const percentChange = extractPercentChange(selectionRangeText);
  const [dateStart, dateEnd] = extractDateRange(
    selectionRangeText,
    timePeriod,
    chartTime
  );
  return {
    company,
    ticker,
    timePeriod,
    chartTime,
    priceChange,
    dateStart,
    dateEnd
  };
}

function extractDateRange(text, timePeriod, chartTime) {
  // Format of text +0.55 (0.37%)  ‎Fri, 13 Dec 15:00-Mon, 16 Dec 11:00
  const dateTimeFormat = timePeriodRegex(timePeriod);
  const dates = text.match(dateTimeFormat);
  if (dates === null) {
    const now = new Date();
    return [now, now];
  }

  console.log("dates", dates);
  let dateStart = null;
  let dateEnd = null;
  if (dates.length === 1) {
    dateStart = dates[0];
    dateEnd = dateStart;
  } else {
    [dateStart, dateEnd] = dates;
  }
  dateStart = makeDateObject(dateStart, timePeriod, chartTime);
  dateEnd = makeDateObject(dateEnd, timePeriod, chartTime);
  return [dateStart, dateEnd];
}

function timePeriodRegex(timePeriod) {
  switch (timePeriod) {
    case "1 day":
      return /\d{2}:\d{2}( \d{4})?/g;
    case "5 days":
      return /\d{1,2} \w{3,4} \d{2}:\d{2}( \d{4})?/g;
    case "1 month":
    case "6 months":
    case "YTD":
      return /\d{1,2} \w{3,4}( \d{4})?/g;
    case "1 year":
    case "5 years":
    case "Max":
      return /\d{1,2} \w{3,4} \d{4}/g;
    default:
      return /\w{3,4}, \d{1,2} \w{3,4}( \d{4})?/g;
  }
}

function extractCompanyName(financeElement) {
  // Returns the company name
  const element = financeElement.getElementsByClassName(COMPANY_CLASS);
  if (element.length === 0) return "";
  return element[0].textContent;
}

function extractTicker(financeElement) {
  const element = financeElement.getElementsByClassName(TICKER_CLASS);
  if (element.length === 0) return "";
  let ticker = element[0].textContent;
  ticker = ticker.split(":")[1].trim();
  return ticker;
}

function extractTimePeriod(financeElement) {
  const element = financeElement.getElementsByClassName(TIME_PERIOD_CLASS);
  if (element.length === 0) return "";
  return element[0].textContent;
}

function extractPriceChange(text) {
  // Format of text is +16.38 (12.48%)  ‎Wed, 6 Nov-Mon, 18 Nov
  // or +16.38 (12.48%)  10:15-10:30
  const priceChange = text.match(/[+|-]\d+.\d{2}/);
  if (priceChange === null) return 0.0;
  return parseFloat(priceChange[0]);
}

function extractPercentChange(text) {
  // Format of text is +16.38 (12.48%)  ‎Wed, 6 Nov-Mon, 18 Nov
  // or +16.38 (12.48%)  10:15-10:30
  const percentChange = text.match(/\d{1,2}.\d{2}\%/);
  if (percentChange === null) return 0.0;
  return parseFloat(percentChange[0]);
}

function processName(companyName) {
  // Removes reference to class A / B / C shares. Tries to shorten stock.
  // Simple split for now.
  const name = companyName.match(/class\W?\s?\w\s/i);
  if (name === null) return companyName;
  companyName = companyName[0].slice(0, name.index);
  return companyName.replace(/\W+$/, "");
}

function makeDateObject(dateText, timePeriod, chartTime) {
  // Bit complex because hovercard not always the same format. Depends on the
  // age of the stock
  if (timePeriod === "1 day") {
    // Checks if the dateText can be formatted into a Date. This requires the year
    // Not sure what happens on say 1st of Jan / 1st of month
    const dateMatch = dateText.match(/\d{2}:\d{2}/);
    if (dateMatch === null) return null;
    const [hour, minute] = dateMatch[0].split(":");
    const date = new Date(Date.parse(chartTime));
    date.setHours(hour);
    date.setMinutes(minute);
    return date;
  }
  const date = new Date(Date.parse(dateText));
  const textContainsYear = dateText.match(/\d{4}/) !== null;
  if (!textContainsYear) date.setFullYear(chartTime.getFullYear());
  return date;
}

function getCurrentChartTime(financeElement) {
  // Gets the latest trading time shown in the chart
  // This is usually in the first section of the chart
  const infoText = financeElement.getElementsByTagName("g-card-section")[0]
    .textContent;
  // Searches for patterns like 1 Nov, 16:15
  const stringDate = infoText.match(/\d{1,2} \w{3,4}, \d{2}:\d{2}/);
  if (stringDate === null) return new Date(); // current time
  const currentYear = new Date().getFullYear();
  const activityDate = new Date(Date.parse(stringDate[0]));
  activityDate.setFullYear(currentYear); // default sets year to 2001
  return activityDate;
}

function getFinancialSummaryElement() {
  return document.getElementById(FINANCE_ELEMENT_ID);
}

function renderIframe() {
  const iframe = document.createElement("iframe");
  iframe.id = IFRAME_ID;
  // index.html needs to be a web accessible resource
  iframe.src = chrome.extension.getURL("index.html");
  iframe.style.display = "none";
  document.body.append(iframe);
}

function showIframe() {
  let iframe = document.getElementById(IFRAME_ID);
  iframe.style.display = "block";
}

function hideIframe() {
  let iframe = document.getElementById(IFRAME_ID);
  iframe.style.display = "none";
}

function toggleIframe() {
  let iframe = document.getElementById(IFRAME_ID);
  if (iframe.style.display === "none") {
    // Show
    iframe.style.setProperty("display", "block", "important");
  } else {
    // hide
    iframe.style.setProperty("display", "none", "important");
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, senderResponse) {
  if (request.action === "browserActionClicked") {
    toggleIframe();
  }
});

function setOnIcon() {
  chrome.runtime.sendMessage({ action: "setOnIcon" });
}

function setOffIcon() {
  chrome.runtime.sendMessage({ action: "setOffIcon" });
}
