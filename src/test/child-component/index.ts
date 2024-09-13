import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import "should";
import { run, runChildArray } from "./script.js";

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

    it("renders a child component array", async () => {
      const dom = new JSDOM(htmlFile(), {
        runScripts: "outside-only",
        resources: "usable",
      });
      const window = dom.window;

      runChildArray(dom);

      const document = await new Promise<Document>((resolve) => {
        window.addEventListener("load", () => {
          resolve(window.document);
        });
      });

      const root = document.getElementById("root") as HTMLElement;
      const parentComponent = root.querySelector(
        "parent-component"
      ) as HTMLElement;

      const basicComponents = Array.from(
        (parentComponent.shadowRoot ?? parentComponent).querySelectorAll(
          "basic-component"
        )
      );

      basicComponents.length.should.equal(3);
    });
  });
}
