import React from "react";
import "./Cluster.css";
import "../functionality/Viewers.css";

export default class Cluster extends React.Component {
  // if cluster.showAll == false, show the first element in the items list + a showAll button whose onClick method toggles cluster.showAll
  // else, show all items in the items list
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
        {dislayItems.map((item, index) => item.render(index > 0))}
        {showMoreButton ? (
          <p
            style={{ marginBlockStart: "0em" }}
            id="show-more-button"
            onClick={() => this.increment()}
          >
            Show more related items
          </p>
        ) : null}
      </ol>
    );
  }
}
