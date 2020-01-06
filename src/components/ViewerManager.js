/*global chrome*/

import React from "react";
import Viewer from "./Viewer";
import { fetchTweets, fetchNews } from "../functionality/dataFetchers";

class ViewerManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewerName: "news",
      userQuery: {}
    };
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener((request, sender, response) => {
      if (request.action === "chartClicked") {
        console.log("React: request received", request);
        let { company, ticker, dateStart, dateEnd } = request.data;
        // convert to date object from string
        dateStart = new Date(dateStart);
        dateEnd = dateEnd === null ? null : new Date(dateEnd);
        this.setState({ userQuery: { company, ticker, dateStart, dateEnd } });
      }
    });
  }

  onClick(viewerName) {
    this.setState({ viewerName: viewerName });
  }

  render() {
    const selectedViewer = this.state.viewerName;
    return (
      <div>
        <h1 style={{ fontSize: "large" }}>What Happened?</h1>
        <div>
          <button onClick={() => this.onClick("news")}>News</button>
          <button onClick={() => this.onClick("tweets")}>Tweets</button>
          <div
            style={{
              display: selectedViewer == "news" ? "block" : "none"
            }}
          >
            <Viewer
              userQuery={this.state.userQuery}
              fetchFunction={fetchNews}
            />
          </div>
          <div
            style={{
              display: selectedViewer == "tweets" ? "block" : "none"
            }}
          >
            <Viewer
              userQuery={this.state.userQuery}
              fetchFunction={fetchTweets}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ViewerManager;
