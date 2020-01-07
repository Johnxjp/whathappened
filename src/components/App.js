/*global chrome*/
import React from "react";
import ViewerManager from "./ViewerManager";
import Header from "./Header";
import SummaryPanel from "./SummaryPanel";
const colloquialNames = require("../data/colloquial_names.json");

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
        let { company, ticker, priceChange, dateStart, dateEnd } = request.data;
        // convert to date object from string
        dateStart = new Date(dateStart);
        dateEnd = dateEnd === null ? null : new Date(dateEnd);
        company = colloquialNames[company] || company;
        this.setState({
          userQuery: { company, ticker, priceChange, dateStart, dateEnd }
        });
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
