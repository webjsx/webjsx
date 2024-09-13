import { flatten, isFragment, isMountedElement } from "./utils.js";
import { exception } from "./exception.js";

// Type definitions for props, elements, and components
export type BasicPrimitive = string | number | boolean | bigint;

export type RenderedNode =
  | WebJsxFragment
  | HTMLElement
  | Text
  | BasicPrimitive
  | undefined
  | Array<RenderedNode>;

export type WebJsxFragment = {
  type: "WEBJSX_FRAGMENT";
  children: Array<RenderedNode>;
};

export type Props = {
  children?: RenderedNode[];
  [key: string]: any;
};

/*
  Fragment constructor.
  We simply use it as a marker in jsx-runtime.
*/
export const Fragment: unique symbol = Symbol.for("WEBJSX_FRAGMENT");

export type MountedElement = HTMLElement & {
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
export class Component<TProps extends Props> {
  name: string;
  render: (props: TProps, component: Component<TProps>) => RenderedNode;
  element?: HTMLElement;
  props: TProps | undefined;
  attachShadow: boolean;
  shadowRootMode: "open" | "closed";

  constructor(config: {
    name: string;
    render: (props: TProps, component: Component<TProps>) => RenderedNode;
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

        appendChildRecursive(newContent, target);
      }
    }
  }
}

// Registry to keep track of defined custom elements
const customElementRegistry: { [key: string]: boolean } = {};

// Function to create WebJSX instance
export function createWebJsxInstance(customEnv: any) {
  const env: WebJsxEnvType = customEnv;

  // Set up internal references to HTMLElement and Text
  env.__internal = env.__internal ?? {
    Text: (env.window as any).Text,
    HTMLElement: (env.window as any).HTMLElement,
  };

  // Function to create DOM elements or custom components
  function createElement<TProps extends Props>(
    tag:
      | keyof HTMLElementTagNameMap
      | ((props: TProps | null) => Component<TProps>)
      | typeof Fragment,
    props: TProps = {} as TProps,
    ...children: RenderedNode[]
  ): HTMLElement | WebJsxFragment {
    // Merge and flatten children into props.children
    const childrenFlattened =
      children.length > 1
        ? flatten(children)
        : children.length === 1
        ? flatten(children[0])
        : undefined;

    if (childrenFlattened !== undefined) {
      props = { ...props, children: childrenFlattened };
    }

    return typeof tag === "function"
      ? createCustomElement(tag, props)
      : tag === Fragment
      ? createFragment(props.children ?? [])
      : typeof tag === "string"
      ? createDOMElement(tag, props)
      : exception(`Unable to handle tag ${tag}`);
  }

  function createCustomElement<TProps extends Props>(
    customElementCtor: (props: TProps | null) => Component<TProps>,
    props: TProps = {} as TProps
  ): HTMLElement {
    // Handle custom component
    const webjsxComponent = customElementCtor(props);

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

    // Set attributes and handle ref, excluding 'children'
    if (props) {
      if (props.ref !== undefined) {
        props.ref.value = customElement;
      }

      for (const [key, value] of Object.entries(props)) {
        if (key === "children") {
          // Do not set 'children' as an attribute
          continue;
        }
        customElement.setAttribute(key, String(value));
      }
    }

    // Render component content with updated props (including children)
    webjsxComponent.setProps(props);
    const renderedContent = webjsxComponent.render(props, webjsxComponent);
    appendChildRecursive(renderedContent, shadowRoot ?? customElement);

    return customElement;
  }

  function createFragment(children: RenderedNode[]): WebJsxFragment {
    return {
      type: "WEBJSX_FRAGMENT",
      children,
    };
  }

  function createDOMElement<TProps extends Props>(
    tag: string,
    props: TProps
  ): HTMLElement {
    // Handle standard HTML elements
    const element = env.document.createElement(tag);

    // Set properties or attributes, excluding 'children'
    if (props) {
      if (props.ref !== undefined) {
        props.ref.value = element;
      }

      for (const [key, value] of Object.entries(props)) {
        if (key === "children") {
          // Do not set 'children' as an attribute
          continue;
        }
        if (key in element) {
          (element as any)[key] = value;
        } else {
          element.setAttribute(key, String(value));
        }
      }
    }

    props.children?.forEach((child) => {
      appendChildRecursive(child, element);
    });

    return element;
  }

  // Recursive function to append child elements
  function appendChildRecursive(
    child: RenderedNode,
    parent: HTMLElement | ShadowRoot
  ) {
    if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "boolean" ||
      typeof child === "bigint"
    ) {
      parent.appendChild(env.document.createTextNode(String(child)));
    } else if (
      child instanceof env.__internal.HTMLElement ||
      child instanceof env.__internal.Text
    ) {
      parent.appendChild(child);
    } else if (Array.isArray(child)) {
      child.forEach((nestedChild) => appendChildRecursive(nestedChild, parent));
    } else if (isFragment(child)) {
      flatten(child.children).forEach((nestedChild) =>
        appendChildRecursive(nestedChild, parent)
      );
    } else {
      console.log({
        child,
      });
      // Handle other potential types or throw an error
      throw new Error("Unsupported child type");
    }
  }

  // Function to mount a component to the DOM
  function mount(element: HTMLElement, container: HTMLElement | string | null) {
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

    root.appendChild(element);
  }

  return {
    createElement,
    mount,
    appendChildRecursive,
  };
}

// Determine the global object (window or globalThis)
const windowObject = typeof globalThis !== "undefined" ? globalThis : window;

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
  component: HTMLElement,
  container: HTMLElement | string | null
) {
  return webjsxInstance.mount(component, container);
}

// Export createElement function
export function createElement<TProps extends Props>(
  tag:
    | keyof HTMLElementTagNameMap
    | ((props: TProps | null) => Component<TProps>),
  props: TProps = {} as TProps,
  ...children: RenderedNode[]
) {
  return webjsxInstance.createElement(tag, props, ...children);
}

export function getComponent(element: HTMLElement): Component<any> {
  return isMountedElement(element)
    ? element.__webjsxComponent
    : exception(
        `${
          element.getAttribute("id")
            ? `${element.tagName}#${element.getAttribute("id")}`
            : element.id
            ? `${element.tagName}#${element.id}`
            : element.tagName
        } has no mounted component.`
      );
}

function appendChildRecursive(
  child: RenderedNode,
  parent: HTMLElement | ShadowRoot
) {
  return webjsxInstance.appendChildRecursive(child, parent);
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
