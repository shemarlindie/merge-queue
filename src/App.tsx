import React from "react";
import {routeConfig} from "./routes/routes";
import {useRoutes} from "react-router-dom";

function App() {
  const routes = useRoutes(routeConfig);

  return (
    <div className="App">
      {routes}
    </div>
  );
}

export default App;
