/* global chrome */

/*
Look into components did update
*/

import React from "react";

class Viewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false
    };
  }

  fetchData(currentQuery) {
    this.setState({ loading: true });
    this.props
      .fetchFunction(currentQuery)
      .then(items => {
        console.log("Received", items);
        this.setState({ data: items, loading: false });
      })
      .catch(err => {
        console.log("error", err);
        this.setState({ data: [], loading: false });
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
    return <ol>{data.map(item => item.render())}</ol>;
  }

  render() {
    return <div>{this.renderViewer()}</div>;
  }
}

export default Viewer;
