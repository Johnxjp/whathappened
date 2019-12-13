/* global chrome */
import React from "react";
import getGoogleNews from "./googleNews.js";
import "./NewsViewer.css";

class NewsViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      news: [],
      loading: false
    };
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener((request, sender, response) => {
      if (request.action === "chartClicked") {
        this.processMessage(request, sender, response);
      }
    });
  }

  processMessage(request, sender, senderResponse) {
    console.log("React: request received", request);
    this.setState({ loading: true });
    console.log(request.data);
    let { company, ticker, dateStart, dateEnd } = request.data;
    dateStart = new Date(dateStart);
    dateEnd = dateEnd === null ? null : new Date(dateEnd);
    getGoogleNews(company, ticker, dateStart, dateEnd)
      .then(news => {
        console.log(news);
        this.setState({ news: news, loading: false });
      })
      .catch(() => this.setState({ news: [], loading: false }));
  }

  renderNews() {
    if (this.state.loading) {
      return <p>Retrieving news...</p>;
    }

    const news = this.state.news;
    if (news.length === 0) {
      return <p>No news</p>;
    }

    return (
      <>
        <h3>Enjoy the News</h3>
        <ol>
          {news.map(item => (
            <li key={item.heading}>
              <a href={item.link} className="news-heading-link">
                {item.heading}
                <span className="news-item-date-source-text">
                  {" "}
                  [{item.source}, {item.time}]
                </span>
              </a>
            </li>
          ))}
        </ol>
      </>
    );
  }

  render() {
    return <div>{this.renderNews()}</div>;
  }
}

export default NewsViewer;
