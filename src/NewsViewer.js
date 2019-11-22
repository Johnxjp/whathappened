/* global chrome */
import React from "react";
import getGoogleNews from "./googleNews.js";

class NewsViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      news: []
    };
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener((request, sender, response) =>
      this.processMessage(request, sender, response)
    );
  }

  processMessage(request, sender, senderResponse) {
    console.log("React: request received", request);
    if (request.action === "chartClicked") {
      let { company, dateStart, dateEnd } = request.data;
      dateStart = new Date(dateStart);
      dateEnd = dateEnd === null ? null : new Date(dateEnd);
      getGoogleNews(company, dateStart, dateEnd)
        .then(news => {
          console.log(news);
          this.setState({ news: news });
        })
        .catch(err => this.setState({ news: [] }));
    }
  }

  renderNews() {
    return <h3>Rendered News</h3>;
  }

  render() {
    return (
      <div>
        {this.state.news.length === 0 ? (
          <h3>Nothing to show</h3>
        ) : (
          this.renderNews()
        )}
      </div>
    );
  }
}

export default NewsViewer;
