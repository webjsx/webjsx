import "./setup.js";
import * as webjsx from "../index.js";
import { expect } from "chai";
import { JSDOM } from "jsdom";
import { applyDiff } from "../applyDiff.js";

describe("JSX Syntax", () => {
  let dom: JSDOM;
  let document: Document;
  let container: HTMLElement;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><body><div id="app"></div></body>`, {
      runScripts: "dangerously",
    });
    document = dom.window.document;
    container = document.getElementById("app") as HTMLElement;
  });

  it("should render JSX elements correctly", () => {
    const vdom = (
      <div id="container">
        <h1>Hello, JSX!</h1>
        <p>This is a paragraph.</p>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div#container");
    expect(div).to.exist;

    const h1 = div?.querySelector("h1");
    const p = div?.querySelector("p");

    expect(h1).to.exist;
    expect(h1?.textContent).to.equal("Hello, JSX!");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("This is a paragraph.");
  });

  it("should handle fragments in JSX", () => {
    const vdom = (
      <>
        <h2>Title</h2>
        <p>Paragraph inside a fragment.</p>
      </>
    );

    applyDiff(container, vdom);

    const h2 = container.querySelector("h2");
    const p = container.querySelector("p");

    expect(h2).to.exist;
    expect(h2?.textContent).to.equal("Title");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Paragraph inside a fragment.");
  });

  it("should handle event handlers in JSX", () => {
    let clicked = false;
    const handleClick = () => {
      clicked = true;
    };

    const vdom = <button onclick={handleClick}>Click Me</button>;

    applyDiff(container, vdom);

    const button = container.querySelector("button");
    expect(button).to.exist;
    expect(button?.textContent).to.equal("Click Me");

    // Simulate click event
    button?.dispatchEvent(new dom.window.Event("click"));
    expect(clicked).to.be.true;
  });

  it("should handle nested JSX elements", () => {
    const vdom = (
      <div class="wrapper">
        <header>
          <h1>Welcome</h1>
        </header>
        <main>
          <p>Main content goes here.</p>
        </main>
        <footer>
          <small>© 2024 WebJSX</small>
        </footer>
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div.wrapper");
    expect(div).to.exist;

    const header = div?.querySelector("header");
    const main = div?.querySelector("main");
    const footer = div?.querySelector("footer");

    expect(header).to.exist;
    expect(header?.querySelector("h1")?.textContent).to.equal("Welcome");

    expect(main).to.exist;
    expect(main?.querySelector("p")?.textContent).to.equal(
      "Main content goes here."
    );

    expect(footer).to.exist;
    expect(footer?.querySelector("small")?.textContent).to.equal(
      "© 2024 WebJSX"
    );
  });

  it("should handle conditional rendering in JSX", () => {
    const isLoggedIn = true;
    const vdom = (
      <div>{isLoggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>}</div>
    );

    applyDiff(container, vdom);

    const p = container.querySelector("p");
    expect(p).to.exist;
    expect(p?.textContent).to.equal("Welcome back!");
  });

  it("should handle lists in JSX with keys", () => {
    const items = ["Apple", "Banana", "Cherry"];

    const vdom = (
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );

    applyDiff(container, vdom);

    const ul = container.querySelector("ul");
    expect(ul).to.exist;
    const lis = ul?.querySelectorAll("li");
    expect(lis).to.have.lengthOf(3);
    expect(lis?.[0].getAttribute("data-key")).to.equal("0");
    expect(lis?.[1].getAttribute("data-key")).to.equal("1");
    expect(lis?.[2].getAttribute("data-key")).to.equal("2");
    expect(lis?.[0].textContent).to.equal("Apple");
    expect(lis?.[1].textContent).to.equal("Banana");
    expect(lis?.[2].textContent).to.equal("Cherry");
  });

  it("should handle fragments with multiple root elements in JSX", () => {
    const vdom = (
      <>
        <h3>Header</h3>
        <section>
          <p>Section paragraph.</p>
        </section>
      </>
    );

    applyDiff(container, vdom);

    const h3 = container.querySelector("h3");
    const section = container.querySelector("section");

    expect(h3).to.exist;
    expect(h3?.textContent).to.equal("Header");
    expect(section).to.exist;
    expect(section?.querySelector("p")?.textContent).to.equal(
      "Section paragraph."
    );
  });

  it("should handle self-closing JSX elements", () => {
    const vdom = (
      <div>
        <img src="image.png" alt="Test Image" />
        <br />
        <input type="text" value="Sample" />
      </div>
    );

    applyDiff(container, vdom);

    const div = container.querySelector("div");
    expect(div).to.exist;

    const img = div?.querySelector("img");
    const br = div?.querySelector("br");
    const input = div?.querySelector("input");

    expect(img).to.exist;
    expect(img?.getAttribute("src")).to.equal("image.png");
    expect(img?.getAttribute("alt")).to.equal("Test Image");

    expect(br).to.exist;

    expect(input).to.exist;
    expect(input?.getAttribute("type")).to.equal("text");
    expect(input?.getAttribute("value")).to.equal("Sample");
  });

  it("should handle dynamic children in JSX", () => {
    const items = ["One", "Two", "Three"];
    const vdom = (
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );

    applyDiff(container, vdom);

    const lis = container.querySelectorAll("li");
    expect(lis).to.have.lengthOf(3);
    expect(lis[0].textContent).to.equal("One");
    expect(lis[1].textContent).to.equal("Two");
    expect(lis[2].textContent).to.equal("Three");
  });
});
