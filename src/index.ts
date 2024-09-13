import {
  flatten,
  isMountedElement,
  isPrimitive,
  isVirtualComponent,
  isVirtualElement,
  isVirtualFragment,
} from "./utils.js";
import { exception } from "./exception.js";

// Type definitions for props, elements, and components
export type BasicPrimitive = string | number | boolean | bigint;

export type Ref<T> = { value?: T };

export type RenderedNode =
  | VirtualComponent
  | VirtualElement
  | VirtualFragment
  | BasicPrimitive
  | undefined;

export type VirtualComponent = {
  type: "COMPONENT";
  ctor: ComponentConstructor;
  component: Component<any>;
  props: Props;
  children: RenderedNode[];
};

export type VirtualElement = {
  type: "ELEMENT";
  tag: string;
  props: Props;
  children: RenderedNode[];
};

export type VirtualFragment = {
  type: "FRAGMENT";
  children: RenderedNode[];
};

export type ComponentConstructor = (props: Props | null) => Component<any>;

// Props type
export type Props = {
  children?: RenderedNode[];
  [key: string]: any;
};

/*
  Fragment constructor.
  We use it as a marker in jsx-runtime.
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
    // Since we're calling an update, the custom element must exist.
    const mountedElement = this.element!;

    if (newProps !== undefined) {
      this.setProps(newProps);
    }

    const target = this.attachShadow
      ? mountedElement.shadowRoot!
      : mountedElement;

    clearChildNodes(target);

    // Re-render and append new content
    const newContent = this.render(this.props as TProps, this);

    appendChildRecursive(
      newContent,
      mountedElement,
      this.attachShadow ? mountedElement.shadowRoot ?? undefined : undefined
    );
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

  // Function to create VirtualElements or fragments
  function createElement<TProps extends Props>(
    tag: string | ComponentConstructor | typeof Fragment,
    props: TProps = {} as TProps,
    ...children: RenderedNode[]
  ): RenderedNode {
    // Merge and flatten children into props.children
    const childrenFlattened =
      children.length > 0 ? flatten(children) : undefined;

    if (childrenFlattened !== undefined) {
      props = { ...props, children: childrenFlattened };
    }

    return typeof tag === "function"
      ? createVirtualComponent(tag, props)
      : tag === Fragment
      ? createVirtualFragment(props.children ?? [])
      : typeof tag === "string"
      ? createVirtualElement(tag, props)
      : exception(`Unable to handle tag ${tag}`);
  }

  function createVirtualComponent<TProps extends Props>(
    ctor: ComponentConstructor,
    props: TProps = {} as TProps
  ): VirtualComponent {
    // Handle custom component
    const component = ctor(props);

    // Register custom element if not already registered
    if (!customElementRegistry[component.name]) {
      class CustomElement extends env.__internal.HTMLElement {}
      env.window.customElements.define(component.name, CustomElement);
      customElementRegistry[component.name] = true;
    }

    // Create a virtual element representing the custom component
    return {
      type: "COMPONENT",
      ctor,
      component: component,
      props,
      children: [], // Children will be handled within the component's render method
    };
  }

  function createVirtualFragment(children: RenderedNode[]): VirtualFragment {
    return {
      type: "FRAGMENT",
      children,
    };
  }

  function createVirtualElement<TProps extends Props>(
    tag: string,
    props: TProps
  ): VirtualElement {
    return {
      type: "ELEMENT",
      tag,
      props,
      children: props.children ?? [],
    };
  }

  // Recursive function to append child elements
  function appendChildRecursive(
    child: RenderedNode,
    parent: Element,
    shadowRoot: ShadowRoot | undefined
  ) {
    // primitive
    if (isPrimitive(child)) {
      (shadowRoot ?? parent).appendChild(
        env.document.createTextNode(String(child))
      );
    }
    // fragment
    else if (isVirtualFragment(child)) {
      child.children.forEach((nestedChild) =>
        appendChildRecursive(nestedChild, parent, shadowRoot)
      );
    }
    // component
    else if (isVirtualComponent(child)) {
      const customElement = env.document.createElement(child.component.name);
      (shadowRoot ?? parent).appendChild(customElement);

      child.component.element = customElement;

      attachProps(customElement, child.props);
      const contents = child.component.render(child.props, child.component);

      appendChildRecursive(
        contents,
        customElement,
        child.component.attachShadow
          ? customElement.attachShadow({ mode: child.component.shadowRootMode })
          : undefined
      );
    }
    // element
    else if (isVirtualElement(child)) {
      const namespace = parent.namespaceURI || "http://www.w3.org/1999/xhtml";
      const isSVG =
        namespace === "http://www.w3.org/2000/svg" || isSVGTag(child.tag);

      const ns = isSVG ? "http://www.w3.org/2000/svg" : undefined;

      const element = ns
        ? env.document.createElementNS(ns, child.tag)
        : env.document.createElement(child.tag);

      (shadowRoot ?? parent).appendChild(element);

      attachProps(element, child.props);

      child.children.forEach((nestedChild) => {
        appendChildRecursive(nestedChild, element, undefined);
      });
    }
  }

  // Helper function to check if a tag is an SVG tag
  function isSVGTag(tag: keyof HTMLElementTagNameMap | string): boolean {
    const svgTags = new Set([
      "svg",
      "circle",
      "ellipse",
      "g",
      "line",
      "path",
      "polygon",
      "polyline",
      "rect",
      "text",
      // Add more SVG tags as needed
    ]);
    return typeof tag === "string" && svgTags.has(tag);
  }

  // Function to mount a component to the DOM
  function mount(
    element: RenderedNode,
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
    clearChildNodes(root);

    // Append the element
    appendChildRecursive(element, root, undefined);
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
  component: RenderedNode,
  container: HTMLElement | string | null
) {
  return webjsxInstance.mount(component, container);
}

// Export createElement function
export function createElement<TProps extends Props>(
  tag: keyof HTMLElementTagNameMap | ComponentConstructor | typeof Fragment,
  props: TProps = {} as TProps,
  ...children: RenderedNode[]
): RenderedNode {
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

function attachProps<TProps extends Props>(element: Element, props: TProps) {
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
}

function appendChildRecursive(
  child: RenderedNode,
  parent: Element,
  shadowRoot: ShadowRoot | undefined
) {
  return webjsxInstance.appendChildRecursive(child, parent, shadowRoot);
}

function clearChildNodes(element: Element | ShadowRoot) {
  // Clear existing content
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
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
  namespace. Some errors arise at compile or build time, and some are only
  visible when a project attempts to consume webjsx.
*/
// This covers a consuming project using the webjsx.createElement jsxFactory
export * as JSX from "./jsxTypes.js";
