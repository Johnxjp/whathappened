import React from "react";
import Viewer from "./Viewer";
import "./ViewerManager.css";
import { fetchNews } from "../functionality/dataFetchers";

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
      // TODO: Can add tutorial on how to use
      return null;
    }
    const selectedViewer = this.state.viewerName;
    return (
      <div
        class="what-happened-viewer"
        style={{
          display: selectedViewer == "news" ? "block" : "none"
        }}
      >
        <Viewer userQuery={this.props.userQuery} fetchFunction={fetchNews} />
      </div>
    );
  }
}

export default ViewerManager;
