// jsx/jsxs rule of thumb:
//
// - Use jsxs if the `children` prop is an array expression with no spreads
// - Use jsx otherwise
//
// Also, when passing props,
//
// - Put the `key` named prop, if any, in the third argument
// - Put all the other props in properties of the second argument
//
// Example:
//
// - <Component /> -> jsx(Component, {})
// - <Component>{x}</Component> -> jsx(Component, { children: x })
// - <Component>{x}{y}</Component> -> jsxs(Component, { children: [x, y] })
// - <Component foo={bar} /> -> jsx(Component, { foo: bar })
// - <Component key={k} /> -> jsx(Component, {}, k)

import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import ReactDOMClient from "react-dom/client";
import { App } from "./App.js";
import { ToastContainer } from "react-toastify";

function main() {
  const rootElement = document.getElementById("root");
  const root = ReactDOMClient.createRoot(rootElement);
  root.render(
    // <>
    jsxs(Fragment, {
      children: [
        // <App />
        jsx(App, {}),
        // <ToastContainer />
        jsx(ToastContainer, {}),
      ],
    }),
    // </>
  );
}

main();
