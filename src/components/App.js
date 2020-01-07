import React from "react";
import ViewerManager from "./ViewerManager";
import Header from "./Header";

class App extends React.Component {
  render() {
    return (
      <>
        <Header />
        <ViewerManager />
      </>
    );
  }
}

export default App;
