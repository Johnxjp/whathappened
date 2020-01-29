import React from "react";
import { NewsDataItem, InteractiveNewsDataItem } from "./DataItem";
import "./Cluster.css";

export default class Cluster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsToShow: 1,
      items: this.props.items || [] // list of NewsDataItems
    };
  }

  increment() {
    this.setState({ itemsToShow: this.state.itemsToShow + 2 });
  }

  render() {
    const dislayItems = this.state.items.slice(0, this.state.itemsToShow);
    const showMoreButton = dislayItems.length < this.state.items.length;
    return (
      <ol>
        {dislayItems.map((item, index) => {
          if (index === 0) {
            return <NewsDataItem data={item} />;
          } else {
            return <NewsDataItem thinText={true} data={item} />;
          }
        })}
        {showMoreButton ? (
          <p id="show-more-button" onClick={() => this.increment()}>
            See {dislayItems.length > 1 ? "more " : ""}related articles
          </p>
        ) : null}
      </ol>
    );
  }
}
