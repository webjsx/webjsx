import * as webjsx from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

const BasicComponent = () => {
  return new webjsx.Component({
    name: "basic-component",
    render() {
      return <div>Hello world</div>;
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  webjsx.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    webjsx.mount(<BasicComponent />, "#root");
  });
}
