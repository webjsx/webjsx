import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import "should";
import { run } from "./script.js";

export default function () {
  describe("child component", () => {
    it("renders a child component", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      run(dom);

      const document = await new Promise<Document>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document);
        });
      });

      const root = document.getElementById("root") as HTMLElement;
      const parentComponent = root.querySelector(
        "parent-component"
      ) as HTMLElement;
      const basicComponent = (
        parentComponent.shadowRoot ?? parentComponent
      ).querySelector("basic-component") as HTMLElement;

      const innerHtml = basicComponent.shadowRoot
        ? basicComponent.shadowRoot.innerHTML
        : basicComponent.innerHTML;

      innerHtml.should.containEql("Hello world");
    });
  });
}
