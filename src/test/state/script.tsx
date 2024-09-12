import * as webjsx from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

export const counterButtonRef: any = {};

const CounterComponent = () => {
  let counter = 0;

  return new webjsx.Component({
    name: "counter-component",
    render(props, component) {
      function inc() {
        counter++;
        component.update();
      }

      return (
        <div>
          <button ref={counterButtonRef} onclick={inc}>
            INC!
          </button>
          Clicked {counter} times.
        </div>
      );
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  webjsx.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    webjsx.mount(<CounterComponent />, "#root");
  });
}
