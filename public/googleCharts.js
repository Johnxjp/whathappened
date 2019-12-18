// TODO: Different event for mouse button down and release
// to get the dateRange

/* global chrome */

// constants
const IFRAMEID = "what-happened-iframe-id";
const HOVERCARDCLASS = "knowledge-finance-wholepage-chart__hover-card";
const CHARTCLASS = "knowledge-finance-wholepage-chart__fw-uch";
const FINANCEELEMENTID = "knowledge-finance-wholepage__entity-summary";
const COMPANYCLASS = "vk_bk";
const TICKERCLASS = "HfMth";
const TIMEPERIODCLASS = "QiGJYb fw-ch-sel";

// Listeners
window.addEventListener("load", () => {
  var element = getFinancialSummaryElement();
  if (element !== null) {
    console.log("Finance chart page detected");
    const interactor = new GoogleChartInteractor(element);
    interactor.addChartListeners();
    renderIframe();
  }
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
        HOVERCARDCLASS
      )[0];
      this.selectionRangeText = hoverCardElement.textContent;
    }
  }

  processMouseUp() {
    if (this.chartHasBeenClicked && this.selectionRangeText !== "") {
      const financeElement = this.financeElement;
      const selectionRangeText = this.selectionRangeText;
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
      console.table({
        selectionText: this.selectionRangeText,
        company: company,
        ticker: ticker,
        timePeriod: timePeriod,
        chartTime: chartTime.toString(),
        priceChange: priceChange,
        dateStart: dateStart === null ? "null" : dateStart.toString(),
        dateEnd: dateEnd === null ? "null" : dateEnd.toString()
      });

      if (isValidSelectionRange(priceChange, dateStart, dateEnd)) {
        sendMessage(company, ticker, dateStart, dateEnd);
      }
      // Adjust Iframe so it displays invalid range for feedback
      showIframe();
    }
    this.chartHasBeenClicked = false;
  }
}

function sendMessage(company, ticker, dateStart, dateEnd = null) {
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
  let paths = event.path;
  for (let element of paths) {
    if (isChartElement(element)) return true;
  }
  return false;
}

function isChartElement(element) {
  // some class names are not a string so do this check first
  return (
    typeof element.className === "string" &&
    element.className.includes(CHARTCLASS)
  );
}

function isValidSelectionRange(priceChange, dateStart, dateEnd) {
  const priceHasChanged = priceChange !== 0.0;
  const startEqualsEnd = dateStart === dateEnd;
  return priceHasChanged && !startEqualsEnd;
}

function extractDateRange(text, timePeriod, chartTime) {
  // Format of text +0.55 (0.37%)  ‎Fri, 13 Dec 15:00-Mon, 16 Dec 11:00
  const dateTimeFormat = timePeriodRegex(timePeriod);
  const dates = text.match(dateTimeFormat);
  if (dates === null) {
    return [new Date(), null];
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
  dateEnd = formatDateObject(dateEnd, timePeriod, chartTime);
  dateStart = formatDateObject(dateStart, timePeriod, chartTime);
  return [dateStart, dateEnd];
}

function timePeriodRegex(timePeriod) {
  switch (timePeriod) {
    case "1 day":
      return /\d{2}:\d{2}( \d{4})?/g;
    case "5 days":
      return /\w{3,4}, \d{1,2} \w{3,4} \d{2}:\d{2}( \d{4})?/g;
    case "1 month":
    case "6 months":
    case "YTD":
      return /\w{3,4}, \d{1,2} \w{3,4}( \d{4})?/g;
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
  const element = financeElement.getElementsByClassName(COMPANYCLASS);
  if (element.length === 0) return "";
  return element[0].textContent;
}

function extractTicker(financeElement) {
  const element = financeElement.getElementsByClassName(TICKERCLASS);
  if (element.length === 0) return "";
  return element[0].textContent;
}

function extractTimePeriod(financeElement) {
  const element = financeElement.getElementsByClassName(TIMEPERIODCLASS);
  if (element.length === 0) return "";
  return element[0].textContent;
}

function extractPriceChange(text) {
  // Format of text is +16.38 (12.48%)  ‎Wed, 6 Nov-Mon, 18 Nov
  // or +16.38 (12.48%)  10:15-10:30
  const priceChange = text.match(/[+|-]\d{1,2}.\d{2}/);
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
  companyName = companyName[0].slice(0, match.index);
  return companyName.replace(/\W+$/, "");
}

function formatDateObject(dateText, timePeriod, chartTime) {
  // Bit complex because hovercard not always the same format. Depends on the
  // age of the stock
  if (timePeriod == "1 day") {
    // Checks if the dateText can be formatted into a Date.
    // This requires the year
    // Not sure what happens on say 1st of Jan / 1st of month
    const dateMatch = dateText.match(/\d{1,2}:\d{2}/);
    if (dateMatch === null) return null;

    const [hour, minute] = dateMatch[0].split(":");
    const date = chartTime.getDate();
    const month = chartTime.getMonth();
    const year = chartTime.getFullYear();
    return new Date(year, month, date, hour, minute);
  }
  let date = new Date(Date.parse(dateText));
  const textContainsYear = dateText.match(/\d{4}/) === null;
  if (textContainsYear) date.setFullYear(chartTime.getFullYear());
  return date;
}

function getCurrentChartTime(financeElement) {
  // Gets the latest trading time shown in the chart
  // This is usually in the first section of the chart
  const infoText = financeElement.getElementsByTagName("g-card-section")[0]
    .textContent;
  // Searches for patterns like 1 Nov, 16:15
  let stringDate = infoText.match(/\d+ \w{3,4}, \d\d:\d\d/);
  if (stringDate === null || infoText.length === 0) {
    return new Date(); // current time
  }
  stringDate = stringDate[0];
  const currentYear = new Date().getFullYear();
  let activityDate = new Date(Date.parse(stringDate));
  activityDate.setFullYear(currentYear); // default sets year to 2001
  return activityDate;
}

function getFinancialSummaryElement() {
  return document.getElementById(FINANCEELEMENTID);
}

function renderIframe() {
  console.log("Page loaded. Rendering iframe");
  const iframe = document.createElement("iframe");
  iframe.id = IFRAMEID;
  // index.html needs to be a web accessible resource
  iframe.src = chrome.extension.getURL("index.html");
  iframe.style.display = "none";
  document.body.append(iframe);
}

function showIframe() {
  let iframe = document.getElementById(IFRAMEID);
  iframe.style.display = "block";
}

function hideIframe() {
  let iframe = document.getElementById(IFRAMEID);
  iframe.style.display = "none";
}

function toggleIframe() {
  let iframe = document.getElementById(IFRAMEID);
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
