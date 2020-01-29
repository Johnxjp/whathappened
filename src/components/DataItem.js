import React from "react";
import "./DataItem.css";

export class NewsDataItem extends React.Component {
  render() {
    const data = this.props.data;
    return (
      <li id="news-item-list" key={data.heading}>
        <a
          href={data.link}
          className="news-heading-link"
          id={
            this.props.thinText
              ? "news-heading-link-normal"
              : "news-heading-link-first"
          }
          target="_blank"
        >
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

export class InteractiveNewsDataItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showText: false
    };
  }

  showExpandedText(text) {
    return (
      <p
        style={{ marginBlockStart: 0, fontSize: "12px", fontWeight: "normal" }}
      >
        {text}
      </p>
    );
  }

  render() {
    const data = this.props.data;
    return (
      <li id="news-item-list" key={data.heading}>
        <p>
          <a
            className="news-heading-link"
            href={data.link}
            id="news-heading-link-first"
            target="_blank"
          >
            {data.heading}
            <span className="news-item-date-source-text">
              {" "}
              [{data.source}, {data.timePosted}]{" "}
            </span>
          </a>
          <span
            id="what-happened-read-more-link"
            onClick={() => this.setState({ showText: !this.state.showText })}
          >
            Show {this.state.showText ? "less" : "more"}
          </span>
        </p>
        {this.state.showText ? this.showExpandedText(data.text) : null}
      </li>
    );
  }
}
