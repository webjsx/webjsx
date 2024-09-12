import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import "should";
import { run } from "./script.js";

export default function () {
  describe("mounts a component", () => {
    it("mounts on a DOM element", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      const innerHtml = await new Promise<string>((resolve) => {
        window.addEventListener("load", () => {
          const root = window.document.getElementById("root") as HTMLElement;
          const component = root.querySelector(
            "basic-component"
          ) as HTMLElement;

          // Check the shadow DOM for the content
          if (component.shadowRoot) {
            resolve(component.shadowRoot.innerHTML);
          } else {
            resolve(root.innerHTML);
          }
        });
      });

      innerHtml.should.containEql("Hello, world");
    });
  });
}
