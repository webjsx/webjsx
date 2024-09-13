import { JSDOM } from "jsdom";
import htmlFile from "../htmlFile.js";
import "should";
import { run, counterButtonRef } from "./script.js";

export default function () {
  describe("component state", () => {
    it("uses and updates component state", async () => {
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
      const component = root.querySelector("counter-component") as HTMLElement;

      counterButtonRef.value.click();
      counterButtonRef.value.click();
      counterButtonRef.value.click();

      const innerHtml = component.shadowRoot
        ? component.shadowRoot.innerHTML
        : component.innerHTML;

      innerHtml.should.containEql("Clicked 3 times");
    });
  });
}
