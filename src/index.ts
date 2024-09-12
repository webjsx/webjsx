// Type definitions for props, elements, and components

type WebJsxElement = HTMLElement | Text;
type ChildElement = WebJsxElement | Array<WebJsxElement> | string | number;

type MountedElement = HTMLElement & {
  __webjsxComponent: Component<any>;
};

// Environment type for WebJSX
export type WebJsxEnvType = {
  window: Window;
  document: Document;
  __internal: {
    HTMLElement: typeof HTMLElement;
    Text: typeof Text;
  };
};

// Component class for creating custom elements
export class Component<TProps extends Record<string, any>> {
  name: string;
  render: (props: TProps, component: Component<TProps>) => WebJsxElement;
  element?: HTMLElement;
  props: TProps | undefined;
  attachShadow: boolean;
  shadowRootMode: "open" | "closed";

  constructor(config: {
    name: string;
    render: (props: TProps, component: Component<TProps>) => WebJsxElement;
    attachShadow?: boolean;
    shadowRootMode?: "open" | "closed";
  }) {
    this.name = config.name;
    this.render = config.render;
    this.element = undefined;
    this.attachShadow = config.attachShadow ?? true;
    this.shadowRootMode = config.shadowRootMode ?? "open";
    this.props = undefined;
  }

  setProps(props: TProps) {
    this.props = props;
  }

  // Method to update the component's DOM
  update(newProps?: TProps) {
    if (newProps !== undefined) {
      this.setProps(newProps);
    }

    if (this.element) {
      const target = this.attachShadow ? this.element.shadowRoot : this.element;

      if (target) {
        // Clear existing content
        while (target.firstChild) {
          target.removeChild(target.firstChild);
        }

        // Re-render and append new content
        const newContent = this.render(this.props as TProps, this);
        target.appendChild(newContent);
      }
    }
  }
}

// Registry to keep track of defined custom elements
const customElementRegistry: { [key: string]: boolean } = {};

// Main function to create a WebJSX instance
export function createWebJsxInstance(customEnv: any) {
  const env: WebJsxEnvType = customEnv;

  // Set up internal references to HTMLElement and Text
  env.__internal = env.__internal ?? {
    Text: (env.window as any).Text,
    HTMLElement: (env.window as any).HTMLElement,
  };

  // Function to create DOM elements or custom components
  function createElement<TProps extends Record<string, any>>(
    tag:
      | keyof HTMLElementTagNameMap
      | ((props: TProps | null) => Component<TProps>),
    props: TProps,
    ...children: ChildElement[]
  ): WebJsxElement {
    if (typeof tag === "function") {
      // Handle custom component
      const webjsxComponent = tag(props);

      // Register custom element if not already registered
      if (!customElementRegistry[webjsxComponent.name]) {
        class CustomElement extends env.__internal.HTMLElement {}
        env.window.customElements.define(webjsxComponent.name, CustomElement);
        customElementRegistry[webjsxComponent.name] = true;
      }

      const customElement = env.document.createElement(webjsxComponent.name);

      // Set up shadow DOM if needed
      let shadowRoot;
      if (webjsxComponent.attachShadow) {
        shadowRoot = customElement.attachShadow({
          mode: webjsxComponent.shadowRootMode,
        });
      }

      // Attach element to webjsxComponent
      webjsxComponent.element = customElement;

      // Reverse attach component in customElement
      (customElement as MountedElement).__webjsxComponent = webjsxComponent;

      // Set attributes and handle ref
      if (props) {
        if (props.ref !== undefined) {
          props.ref.value = customElement;
        }

        for (const [key, value] of Object.entries(props)) {
          customElement.setAttribute(key, String(value));
        }
      }

      // Render component content
      webjsxComponent.setProps(props);
      const renderedContent = webjsxComponent.render(props, webjsxComponent);

      // Append content to shadow root or element
      if (shadowRoot) {
        shadowRoot.appendChild(renderedContent);
      } else {
        customElement.appendChild(renderedContent);
      }

      return customElement;
    }

    // Handle standard HTML elements
    const element = env.document.createElement(tag);

    // Set properties or attributes
    if (props) {
      if (props.ref !== undefined) {
        props.ref.value = element;
      }

      for (const [key, value] of Object.entries(props)) {
        if (key in element) {
          (element as any)[key] = value;
        } else {
          element.setAttribute(key, String(value));
        }
      }
    }

    // Append children
    children.forEach((child) => {
      if (typeof child === "string" || typeof child === "number") {
        element.appendChild(env.document.createTextNode(String(child)));
      } else if (
        child instanceof env.__internal.HTMLElement ||
        child instanceof env.__internal.Text
      ) {
        element.appendChild(child);
      } else if (Array.isArray(child)) {
        child.forEach((nestedChild) => {
          if (
            typeof nestedChild === "string" ||
            typeof nestedChild === "number"
          ) {
            element.appendChild(
              env.document.createTextNode(String(nestedChild))
            );
          } else if (
            nestedChild instanceof env.__internal.HTMLElement ||
            nestedChild instanceof env.__internal.Text
          ) {
            element.appendChild(nestedChild);
          }
        });
      }
    });

    return element;
  }

  // Function to mount a component to the DOM
  function mount(
    component: WebJsxElement,
    container: HTMLElement | string | null
  ) {
    const root =
      typeof container === "string"
        ? env.document.querySelector(container)
        : container;

    if (!root) {
      throw new Error("Root element not found.");
    }

    // Clear existing content
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }

    // Append the component
    root.appendChild(component);
  }

  return {
    createElement,
    mount,
  };
}

// Determine the global object (window or globalThis)
const windowObject = globalThis !== undefined ? globalThis : window;

// Create initial WebJSX instance
let webjsxInstance = createWebJsxInstance({
  window: windowObject,
  document: windowObject.document,
});

// Function to set a custom environment
export function setCustomEnv(customEnv: any) {
  webjsxInstance = createWebJsxInstance(customEnv);
}

// Export mount function
export function mount(
  component: WebJsxElement,
  container: HTMLElement | string | null
) {
  return webjsxInstance.mount(component, container);
}

// Export createElement function
export function createElement<TProps extends Record<string, any>>(
  tag:
    | keyof HTMLElementTagNameMap
    | ((props: TProps | null) => Component<TProps>),
  props: TProps,
  ...children: ChildElement[]
) {
  return webjsxInstance.createElement(tag, props, ...children);
}

export function getComponent(element: HTMLElement): Component<any> {
  return isMountedElement(element)
    ? element.__webjsxComponent
    : exception(
        `${
          element.getAttribute("id") ?? element.id ?? element.tagName
        } has no mounted component.`
      );
}

function exception(message: string): never {
  throw new Error(message);
}

function isMountedElement(element: HTMLElement): element is MountedElement {
  return (
    (element as unknown as { __webjsxComponent: Component<any> })
      .__webjsxComponent !== undefined
  );
}

/* JSX Types */
/*
  JSX typings expect a JSX namespace to be in scope for the webjsx module (if a
  using a jsxFactory like webjsx.createElement), or attached to the naked factory
  function (if using a jsxFactory like createElement).

  See: https://www.typescriptlang.org/docs/handbook/jsx.html#intrinsic-elements
  Also: https://dev.to/ferdaber/typescript-and-jsx-part-ii---what-can-create-jsx-22h6
  Also: https://www.innoq.com/en/blog/type-checking-tsx/

  Note that importing a module turns it into a namespace on this side of the
  import, so it doesn't need to be declared as a namespace inside jsxTypes.ts.
  However, attempting to declare it that way causes no end of headaches either
  when trying to reexport it here, or reexport it from a createElement
  namespace. Some errors arise at comple or build time, and some are only
  visible when a project attempts to consume webjsx.
*/
// This covers a consuming project using the webjsx.createElement jsxFactory
export * as JSX from "./jsxTypes.js";

// If jsxTypes is imported using named imports, esbuild doesn't know how to
// erase the imports and gets pset that "JSX" isn't an actual literal value
// inside the jsxTypes.ts module. We have to import as a different name than the
// export within createElement because I can't find a way to export a namespace
// within a namespace without using import aliases.
import * as JSXTypes from "./jsxTypes.js";
// The createElement namespace exists so that users can set their TypeScript
// jsxFactory to createElement instead of webjsx.createElement.// eslint-disable-next-line @typescript-eslint/no-namespace

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace createElement {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import JSX = JSXTypes;
}
