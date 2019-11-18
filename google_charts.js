// TODO: Different event for mouse button down and release
// to get the dateRange

const MONTHSTOINT = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sept: 8,
  oct: 9,
  nov: 10,
  dec: 11,
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11
};

function hasClickedChart(mouseEvent) {
  // Checks if clicked on chart
  const paths = mouseEvent.path;
  const chartElementClassName = "knowledge-finance-wholepage-chart__fw-uch";

  for (element of paths) {
    let elementClassName = element.className;
    if (
      typeof elementClassName === "string" &&
      elementClassName.includes(chartElementClassName)
    ) {
      return true;
    }
  }
  return false;
}

function extractCompanyName(element) {
  // Returns the company name
  const spanClassName = "vk_bk";
  const spanElement = element.getElementsByClassName(spanClassName)[0];
  return spanElement.textContent;
}

function formatDateObject(dateText, today, timePeriod) {
  // Bit complex because hovercard not always the same format. Depends on the
  // age of the stock
  switch (timePeriod) {
    case "1 day":
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
      if (date.getFullYear() == "2001") {
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

function extractDateRange(element) {
  // Make sure that dateStart >= dateEnd. As you can drag drop range
  // forwards and backwards
  const hoverCardSpanClassName =
    "knowledge-finance-wholepage-chart__hover-card-time";
  const selectedTimePeriodClassName = "QiGJYb fw-ch-sel";
  const dateText = element.getElementsByClassName(hoverCardSpanClassName)[0]
    .textContent;
  const selectedTimePeriod = element.getElementsByClassName(
    selectedTimePeriodClassName
  )[0].textContent;

  const latestActivityDate = getCurrentChartTime(element);
  console.log("Most recent market activity", latestActivityDate);

  var [dateStart, dateEnd] = dateText.split("-");
  dateStart = formatDateObject(
    dateStart,
    latestActivityDate,
    selectedTimePeriod
  );
  if (dateEnd === undefined) {
    dateEnd = null;
  } else {
    dateEnd = formatDateObject(dateEnd, latestActivityDate, selectedTimePeriod);
  }

  return [dateStart, dateEnd];
}

function financialSummaryElement() {
  const idName = "knowledge-finance-wholepage__entity-summary";
  return document.getElementById(idName);
}

function processClickEvent(event) {
  // Will send a message to the background containing company and date
  console.log(`Click Detected on ${window.location.href}`);
  console.log(event);
  if (hasClickedChart(event)) {
    const element = financialSummaryElement();
    console.log("Summary Element", element);

    const company = extractCompanyName(element);

    // Note dateEnd can be null
    const [dateStart, dateEnd] = extractDateRange(element);
    console.log(
      "Company",
      company,
      "date start",
      dateStart,
      "date end",
      dateEnd
    );
    sendMessage(company, dateStart, dateEnd);
  }
}

function sendMessage(company, dateStart, dateEnd = null) {
  chrome.runtime.sendMessage({
    company: company,
    dateStart: dateStart,
    dateEnd: dateEnd
  });
}

document.body.addEventListener("click", processClickEvent, true);
