/*global chrome*/
import React from "react";
import ViewerManager from "./ViewerManager";
import Header from "./Header";
import SummaryPanel from "./SummaryPanel";
// const colloquialNames = require("../data/colloquial_names.json");
import colloquialise from "../functionality/colloquialise";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userQuery: {}
    };
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(request => {
      if (request.action === "chartClicked") {
        console.log("React: request received", request);
        const userQuery = request.data;
        userQuery.dateStart = new Date(userQuery.dateStart);
        // convert to date object from string
        userQuery.dateEnd =
          userQuery.dateEnd === null ? null : new Date(userQuery.dateEnd);
        userQuery.company = colloquialise(userQuery.company);
        this.setState({ userQuery });
      }
    });
  }

  render() {
    return (
      <>
        <Header />
        <SummaryPanel userQuery={this.state.userQuery} />
        <ViewerManager userQuery={this.state.userQuery} />
      </>
    );
  }
}
