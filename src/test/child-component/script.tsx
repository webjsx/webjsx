import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

const ChildComponent = () => {
  return new forgo.Component({
    name: "basic-component",
    render() {
      return <div>Hello world</div>;
    },
  });
};

const ParentComponent = () => {
  return new forgo.Component({
    name: "parent-component",
    render() {
      return <ChildComponent />;
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  forgo.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    forgo.mount(<ParentComponent />, "#root");
  });
}
