// TODO: Different event for mouse button down and release
// to get the dateRange

function searchNews(company, dateRange) {
  // Could be in background.js? - ask question
}

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

function extractDateRange(element) {
  // Need to create a date object with (day, month, year, hour)
  const spanClassName = "knowledge-finance-wholepage-chart__hover-card-time";
  let dateText = element.getElementsByClassName(spanClassName)[0].textContent;
  var [dateStart, dateEnd] = dateText.split("-");
  if (dateEnd === undefined) {
    dateEnd = null;
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
    console.log("Company Name", company);

    // Note dateEnd can be nukll
    const [dateStart, dateEnd] = extractDateRange(element);
    console.log("Date Start", dateStart, "Date End", dateEnd);
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
