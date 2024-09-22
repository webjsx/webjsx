import { VNode, Fragment } from "./types.js";

export function setAttributes(
  el: HTMLElement,
  props: { [key: string]: any }
): void {
  for (const [key, value] of Object.entries(props)) {
    if (key === "children" || key === "key") continue;

    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      const existingListener = (el as any).__webjsx_listeners?.[eventName];
      if (existingListener) {
        el.removeEventListener(eventName, existingListener);
      }
      el.addEventListener(eventName, value);
      (el as any).__webjsx_listeners = {
        ...((el as any).__webjsx_listeners || {}),
        [eventName]: value,
      };
    } else if (typeof value === "string") {
      // Apply string attributes via setAttribute
      el.setAttribute(key, value);
    } else {
      // Ensure non-string values like `value` are applied as properties
      (el as any)[key] = value;
    }
  }

  // Handle removing old attributes not present in new props
  const currentAttrs = Array.from(el.attributes).map((attr) => attr.name);
  for (const attr of currentAttrs) {
    if (!(attr in props) && !attr.startsWith("on")) {
      el.removeAttribute(attr);
    }
  }

  // Resetting old properties if not in new props
  const oldProps = (el as any).__webjsx_props || {};
  for (const key of Object.keys(oldProps)) {
    if (!(key in props)) {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        const existingListener = (el as any).__webjsx_listeners?.[eventName];
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
          delete (el as any).__webjsx_listeners[eventName];
        }
      } else {
        (el as any)[key] = undefined;
      }
    }
  }

  // Store the current props for future updates
  (el as any).__webjsx_props = props;
}

export function createDomNode(vnode: VNode): Node {
  if (
    typeof vnode === "string" ||
    typeof vnode === "number" ||
    typeof vnode === "boolean"
  ) {
    return document.createTextNode(String(vnode));
  }

  if (vnode.type === Fragment) {
    const fragment = document.createDocumentFragment();
    if (vnode.props.children) {
      vnode.props.children.forEach((child) => {
        fragment.appendChild(createDomNode(child));
      });
    }
    return fragment;
  }

  const el = document.createElement(vnode.type as string);

  // Set attributes (now includes direct property assignment for non-string props)
  if (vnode.props) {
    setAttributes(el, vnode.props);
  }

  // Assign key to DOM node (use data-key now)
  if (vnode.props.key != null) {
    (el as any).__webjsx_key = vnode.props.key;
    el.setAttribute("data-key", String(vnode.props.key));
  }

  // Handle children
  if (vnode.props.children) {
    vnode.props.children.forEach((child) => {
      el.appendChild(createDomNode(child));
    });
  }

  return el;
}

export function updateAttributes(
  el: HTMLElement,
  newProps: { [key: string]: any },
  oldProps: { [key: string]: any }
): void {
  // Set new and update existing attributes
  for (const [key, value] of Object.entries(newProps)) {
    if (key === "children" || key === "key") continue;

    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      const existingListener = (el as any).__webjsx_listeners?.[eventName];
      if (existingListener !== value) {
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
        }
        el.addEventListener(eventName, value);
        (el as any).__webjsx_listeners = {
          ...((el as any).__webjsx_listeners || {}),
          [eventName]: value,
        };
      }
    } else if (typeof value === "string") {
      // If the value is a string, use setAttribute
      el.setAttribute(key, value);
    } else {
      // Otherwise, set it as a property on the element
      (el as any)[key] = value;
    }
  }

  // Remove old attributes not present in new props
  for (const key of Object.keys(oldProps)) {
    if (!(key in newProps) && key !== "children" && key !== "key") {
      if (key.startsWith("on")) {
        const eventName = key.substring(2).toLowerCase();
        const existingListener = (el as any).__webjsx_listeners?.[eventName];
        if (existingListener) {
          el.removeEventListener(eventName, existingListener);
          delete (el as any).__webjsx_listeners[eventName];
        }
      } else {
        el.removeAttribute(key);
      }
    }
  }
}
