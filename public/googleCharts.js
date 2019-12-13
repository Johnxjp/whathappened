// TODO: Different event for mouse button down and release
// to get the dateRange

/* global chrome */

// constants
const IFRAMEID = "what-happened-iframe-id";

// Listeners
window.addEventListener("load", renderIframe);

class GoogleChartInteractor {
  constructor() {
    this.addChartListeners();
    this.clickedChart = false;
    this.hoverCardText = "";
  }

  addChartListeners() {
    var chartElement = financialSummaryElement();
    if (chartElement !== null) {
      chartElement.addEventListener("mousedown", event => {
        this.hasClickedChart(event);
        this.hoverCardText = "";
      });
      chartElement.addEventListener("mouseup", () => {
        console.log(this.hoverCardText);
        if (this.clickedChart && this.hoverCardText !== "") {
          this.getNews(chartElement);
        }
        this.clickedChart = false;
      });

      chartElement.addEventListener("mousemove", () => {
        if (this.clickedChart) {
          let hoverCard = document.body.querySelector(
            ".knowledge-finance-wholepage-chart__hover-card"
          );
          this.hoverCardText = hoverCard.textContent;
        }
      });
    }
  }

  hasClickedChart(mouseEvent) {
    // Checks if clicked on chart. Cannot attach a click listener to chart
    // directly because chart changes everytime new date is selected
    const paths = mouseEvent.path;
    const chartClass = "knowledge-finance-wholepage-chart__fw-uch";
    for (let element of paths) {
      // sometimes not string
      if (
        typeof element.className === "string" &&
        element.className.includes(chartClass)
      ) {
        this.clickedChart = true;
        return;
      }
    }
    this.clickedChart = false;
  }

  isValidHoverCardText(priceChange, dateStart, dateEnd) {
    const hasPriceChanged = priceChange !== 0.0;
    const isValidDates = dateStart !== dateEnd;
    return isValidDates && hasPriceChanged;
  }

  parseHoverCardText(text, timePeriod, currentChartTime) {
    // Returns all the desired info from the hovercard text
    // Todo: Get Price Start and price end using mouse up information
    let parsedObject = {
      priceChange: 0.0,
      percentChange: 0.0,
      dateStart: null,
      dateEnd: null
    };
    const index = text.indexOf(")");
    if (index === -1) {
      return parsedObject;
    }

    let priceText = text.slice(0, index + 1).trim();
    let dateText = text.slice(index + 1).trim();
    while (!dateText[0].match(/^[a-zA-Z0-9]+$/i)) {
      dateText = dateText.slice(1);
    }

    let [priceChange, percentChange] = priceText.split(" ");
    priceChange = parseFloat(priceChange);
    percentChange = parseFloat(percentChange.slice(1, -1));

    let [dateStart, dateEnd] = extractDateRange(
      dateText,
      timePeriod,
      currentChartTime
    );
    parsedObject.priceChange = priceChange;
    parsedObject.percentChange = percentChange;
    parsedObject.dateStart = dateStart;
    parsedObject.dateEnd = dateEnd;
    return parsedObject;
  }

  getNews(financeElement) {
    // Will send a message to the background containing company and date
    let company = extractCompanyName(financeElement);
    company = processName(company);

    const ticker = extractCompanyTicker(financeElement);
    const selectedTimePeriod = financeElement.getElementsByClassName(
      "QiGJYb fw-ch-sel"
    )[0].textContent;

    const currentChartTime = getCurrentChartTime(financeElement);
    console.log("Most recent market activity", currentChartTime);

    const parsedHoverCard = this.parseHoverCardText(
      this.hoverCardText,
      selectedTimePeriod,
      currentChartTime
    );
    if (
      this.isValidHoverCardText(
        parsedHoverCard.priceChange,
        parsedHoverCard.dateStart,
        parsedHoverCard.dateEnd
      )
    ) {
      sendMessage(
        company,
        ticker,
        parsedHoverCard.dateStart,
        parsedHoverCard.dateEnd
      );
    }
    showIframe();
  }
}

function extractDateRange(dateText, chartTimePeriod, currentChartTime) {
  let [dateStart, dateEnd] = dateText.split("-");
  dateStart = formatDateObject(dateStart, currentChartTime, chartTimePeriod);
  if (dateEnd === undefined) {
    dateEnd = null;
  } else {
    dateEnd = formatDateObject(dateEnd, currentChartTime, chartTimePeriod);
  }
  return [dateStart, dateEnd];
}

var chartInteractor = null;
window.addEventListener("load", () => {
  chartInteractor = new GoogleChartInteractor();
});

function renderIframe() {
  const isGoogleStockPage = financialSummaryElement() !== null;
  if (isGoogleStockPage) {
    console.log("Page loaded. Rendering iframe");
    let iframe = document.createElement("iframe");
    iframe.id = IFRAMEID;
    iframe.src = chrome.extension.getURL("index.html");
    iframe.style.display = "none";
    document.body.append(iframe);
  }
}

function extractCompanyName(summaryElement) {
  // Returns the company name
  const elements = summaryElement.getElementsByClassName("vk_bk");
  if (elements.length === 0) {
    return "";
  }
  return elements[0].textContent;
}

function extractCompanyTicker(summaryElement) {
  const elements = summaryElement.getElementsByClassName("HfMth");
  if (elements.length === 0) {
    return "";
  }
  return elements[0].textContent;
}

function processName(companyName) {
  // Simple split for now
  const match = companyName.match(/class\W?\s?\w\s/i);
  if (match !== null) {
    const index = match.index;
    companyName = companyName.slice(0, index);
    // Horrible code - change
    while (!companyName[companyName.length - 1].match(/^[a-zA-Z]+$/i)) {
      companyName = companyName.slice(0, companyName.length);
    }
  }
  return companyName;
}

function formatDateObject(dateText, today, timePeriod) {
  // Bit complex because hovercard not always the same format. Depends on the
  // age of the stock

  // TODO: Invalid start date on 1 day
  switch (timePeriod) {
    case "1 day":
      // Checks if the dateText can be formatted into a Date.
      // This requires the year
      if (isNaN(Date.parse(dateText))) {
        let [hour, minute] = dateText.split(":");
        return new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hour,
          minute
        );
      } else {
        return new Date(Date.parse(dateText));
      }

    default:
      var date = new Date(Date.parse(dateText));
      // searches for year string
      const textContainsYear = dateText.search(/\d{4}/);
      if (textContainsYear === -1) {
        date.setFullYear(today.getFullYear());
      }
      return date;
  }
}

function getCurrentChartTime(chartElement) {
  // Gets the latest trading time shown in the chart
  // This is usually in the first section of the chart
  const infoText = chartElement.getElementsByTagName("g-card-section")[0]
    .textContent;

  // Searches for patterns like 1 Nov, 16:15
  var regex = /\d+ \w{3,4}, \d\d:\d\d/i;
  var stringDate = infoText.match(regex);
  if (stringDate !== null) {
    stringDate = stringDate[0];
    let today = new Date();
    let activityDay = new Date(Date.parse(stringDate));
    activityDay.setFullYear(today.getFullYear());
    return activityDay;
  }
  return new Date();
}

function financialSummaryElement() {
  const elementId = "knowledge-finance-wholepage__entity-summary";
  return document.getElementById(elementId);
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
    iframe.style.setProperty("display", "block", "important");
  } else {
    iframe.style.setProperty("display", "none", "important");
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

chrome.runtime.onMessage.addListener(function(request, sender, senderResponse) {
  if (request.action === "browserActionClicked") {
    toggleIframe();
  }
});
