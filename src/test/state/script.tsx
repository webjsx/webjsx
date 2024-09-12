import * as forgo from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

export const counterButtonRef: any = {};

const CounterComponent = () => {
  let counter = 0;

  return new forgo.Component({
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
  forgo.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    forgo.mount(<CounterComponent />, "#root");
  });
}
