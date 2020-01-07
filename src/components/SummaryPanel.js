import React from "react";
import "./SummaryPanel.css";

export default class SummaryPanel extends React.Component {
  getPriceColor(priceChange) {
    if (priceChange > 0) {
      return "green";
    } else if (priceChange < 0) {
      return "red";
    } else {
      return "lightgray";
    }
  }

  formatDateString(dateStart, dateEnd) {
    const options = { dateStyle: "short", timeStyle: "short" };
    const [startDate, startTime] = dateStart
      .toLocaleString({}, options)
      .split(", ");
    const [endDate, endTime] = dateEnd.toLocaleString({}, options).split(", ");

    if (dateStart.getTime() === dateEnd.getTime()) {
      if (startTime === "00:00") {
        return startDate;
      }
      return startDate + " " + startTime;
    }
    if (startDate === endDate) {
      return startDate + ", " + startTime + "-" + endTime;
    }

    let text = startDate + " " + startTime + "-" + endDate + " " + endTime;
    return text.replace(/ 00:00/g, "");
  }

  render() {
    if (Object.keys(this.props.userQuery).length === 0) {
      return null;
    }

    const {
      company,
      ticker,
      dateStart,
      dateEnd,
      priceChange
    } = this.props.userQuery;
    return (
      <div id="what-happened-summary">
        <h2 id="what-happened-summary-company">
          {company} ({ticker})
        </h2>
        <p id="what-happened-summary-date-range">
          {this.formatDateString(dateStart, dateEnd)}
        </p>
        <p
          id="what-happened-summary-price"
          style={{ color: this.getPriceColor(priceChange) }}
        >
          {priceChange}
        </p>
      </div>
    );
  }
}
