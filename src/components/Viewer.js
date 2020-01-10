/* global chrome */

/*
Look into components did update
*/

import React from "react";
import preprocess from "../functionality/utils";
import Cluster from "./Cluster";

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      clusters: [],
      loading: false
    };
  }

  fetchData(currentQuery) {
    this.setState({ loading: true });
    this.props
      .fetchFunction(currentQuery)
      .then(items => {
        console.log("Received", items);
        const processed_data = preprocess(
          items,
          this.props.userQuery.company,
          this.props.userQuery.ticker
        );
        this.clusterData(processed_data)
          .then(clusterIndices => {
            console.log("clusters", clusterIndices);
            const clusters = clusterIndices.map(indexList => {
              return <Cluster items={indexList.map(index => items[index])} />;
            });
            this.setState({ data: items, clusters: clusters, loading: false });
          })
          .catch(err => {
            console.log(err);
            this.setState({ data: items, clusters: [], loading: false });
          });
      })
      .catch(err => {
        console.log("error", err);
        this.setState({ data: [], clusters: [], loading: false });
      });
  }

  clusterData(items) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "clusterNews", items: items },
        response => {
          if (response.success) {
            resolve(response.clustersIndices);
          } else {
            reject(new Error("No data"));
          }
        }
      );
    });
  }

  componentDidMount() {
    this.fetchData(this.props.userQuery);
  }

  componentDidUpdate(prevProps) {
    const currentPropsQuery = JSON.stringify(this.props.userQuery);
    const prevPropsQuery = JSON.stringify(prevProps.userQuery);
    if (currentPropsQuery !== prevPropsQuery) {
      this.fetchData(this.props.userQuery);
    }
  }

  renderViewer() {
    if (this.state.loading) {
      return <p>Retrieving content...</p>;
    }
    const data = this.state.data;
    if (data.length === 0) {
      return (
        <p>
          Sorry, we couldn't find anything. Try again or try a different period.
        </p>
      );
    }
    const clusters = this.state.clusters;
    let introText = "Here are some possible explanations:";
    if (clusters.length === 0) {
      introText =
        "We couldn't identify any significant events, but here are some articles that might help.";
    }
    return (
      <div>
        <p style={{ marginBlockStart: "0em" }}>{introText}</p>
        {this.state.clusters.map(cluster => cluster)}
      </div>
    );
  }

  render() {
    return <div>{this.renderViewer()}</div>;
  }
}

export default Viewer;
