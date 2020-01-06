import React from "react";
import "./Viewers.css";

class dataItem {
  constructor(data) {
    this.data = data;
  }

  render() {}
}

export class NewsDataItem extends dataItem {
  render() {
    const data = this.data;
    return (
      <li id="news-item-list" key={data.heading}>
        <a href={data.link} className="news-heading-link">
          {data.heading}
          <span className="news-item-date-source-text">
            {" "}
            [{data.source}, {data.timePosted}]
          </span>
        </a>
      </li>
    );
  }
}

export class TwitterDataItem extends dataItem {
  render() {
    const data = this.data;
    return (
      <li id="tweet-item-list" key={data}>
        <a href={data.tweetURL} className="tweet-heading-link">
          {data.text}{" "}
          <span className="tweet-item-date-source-text">
            [
            <a style={{ color: "lightblue" }} href={data.accountTwitterURL}>
              @{data.handle}
            </a>
            , {data.date}]
          </span>
        </a>
      </li>
    );
  }
}
