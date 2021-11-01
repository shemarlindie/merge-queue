import React from "react";
import ReactDOM from "react-dom";
import "./custom.scss";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {BrowserRouter} from "react-router-dom";
import {SnackbarProvider} from "notistack";
import {ConfirmProvider} from "material-ui-confirm";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider>
        <ConfirmProvider>
          <App/>
        </ConfirmProvider>
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
