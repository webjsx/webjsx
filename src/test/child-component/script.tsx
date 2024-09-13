import * as webjsx from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

const ChildComponent = () => {
  return new webjsx.Component({
    name: "basic-component",
    render() {
      return <div>Hello world</div>;
    },
  });
};

const ParentComponent = () => {
  return new webjsx.Component({
    name: "parent-component",
    render() {
      return <ChildComponent />;
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  webjsx.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    webjsx.mount(<ParentComponent />, "#root");
  });
}

const ParentComponentWithChildArray = () => {
  return new webjsx.Component({
    name: "parent-component",
    render() {
      return (
        <>
          <ChildComponent />
          <ChildComponent />
          <ChildComponent />
        </>
      );
    },
  });
};

export function runChildArray(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  webjsx.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    webjsx.mount(<ParentComponentWithChildArray />, "#root");
  });
}
