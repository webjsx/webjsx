import * as webjsx from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";
import { mount, setCustomEnv } from "../../index.js";

let window: DOMWindow;
let document: Document;

export let inputRef: webjsx.Ref<HTMLInputElement> = {};

const Parent = () => {
  return new webjsx.Component({
    name: "parent-component",
    render() {
      return (
        <div>
          <input type="text" ref={inputRef} />
        </div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    mount(<Parent />, document.getElementById("root"));
  });
}
