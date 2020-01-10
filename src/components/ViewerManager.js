import React from "react";
import Viewer from "./Viewer";
import "./ViewerManager.css";
import { fetchTweets, fetchNews } from "../functionality/dataFetchers";

class ViewerManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewerName: "news"
    };
  }

  onClick(viewerName) {
    this.setState({ viewerName: viewerName });
  }

  buttonStyle(isSelected) {
    const on = {
      color: "darkorange",
      fontWeight: "bold",
      borderColor: "transparent",
      borderBottom: "1px darkorange solid",
      backgroundColor: "transparent"
    };
    const off = {
      color: "lightgray",
      fontWeight: "normal",
      border: "none",
      backgroundColor: "transparent"
    };
    return isSelected ? on : off;
  }

  render() {
    if (Object.keys(this.props.userQuery).length === 0) {
      return null;
    }
    const selectedViewer = this.state.viewerName;
    return (
      <div>
        <div>
          {/* <div id="what-happened-viewer-manager-header">
            <div>
              <button
                style={this.buttonStyle(selectedViewer === "news")}
                onClick={() => this.onClick("news")}
              >
                News
              </button>
              <button
                style={this.buttonStyle(selectedViewer === "tweets")}
                onClick={() => this.onClick("tweets")}
              >
                Tweets
              </button>
            </div>
          </div> */}
          <div
            class="what-happened-viewer"
            style={{
              display: selectedViewer == "news" ? "block" : "none"
            }}
          >
            <Viewer
              userQuery={this.props.userQuery}
              fetchFunction={fetchNews}
            />
          </div>
          {/* <div
            class="what-happened-viewer"
            style={{
              display: selectedViewer == "tweets" ? "block" : "none"
            }}
          >
            <Viewer
              userQuery={this.props.userQuery}
              fetchFunction={fetchTweets}
            />
          </div> */}
        </div>
      </div>
    );
  }
}

export default ViewerManager;
