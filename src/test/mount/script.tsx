import * as webjsx from "../../index.js";
import { DOMWindow, JSDOM } from "jsdom";

let window: DOMWindow;
let document: Document;

type BasicComponentProps = { greeting: string };

const BasicComponent = (props: BasicComponentProps) => {
  return new webjsx.Component<BasicComponentProps>({
    name: "basic-component",
    render(props, component) {
      return <div>{props.greeting}</div>;
    },
  });
};

export function run(dom: JSDOM) {
  window = dom.window;
  document = window.document;
  webjsx.setCustomEnv({ window, document });

  window.addEventListener("load", () => {
    webjsx.mount(<BasicComponent greeting="Hello, world" />, "#root");
  });
}
