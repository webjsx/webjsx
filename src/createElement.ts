import { Fragment, VElement, VNode } from "./types.js";

/**
 * Implementation of createElement function.
 */
export function createElement(
  type: string | typeof Fragment,
  props: { [key: string]: any } | null,
  ...children: any[]
): VElement {
  const normalizedProps: { [key: string]: any } = props ? { ...props } : {};

  const flatChildren: VNode[] = [];

  const flatten = (child: any) => {
    if (Array.isArray(child)) {
      child.forEach(flatten);
    } else if (
      typeof child === "string" ||
      typeof child === "number" ||
      typeof child === "boolean"
    ) {
      flatChildren.push(child);
    } else if (child === null || child === undefined) {
      // Ignore null or undefined children
    } else {
      flatChildren.push(child);
    }
  };

  children.forEach(flatten);

  if (flatChildren.length > 0) {
    // Only set children if dangerouslySetInnerHTML is not present
    if (!normalizedProps.dangerouslySetInnerHTML) {
      normalizedProps.children = flatChildren;
    } else {
      // Optionally, you can warn the user that children are ignored when using dangerouslySetInnerHTML
      console.warn(
        "WebJSX: Ignoring children since dangerouslySetInnerHTML is set."
      );
    }
  }

  return {
    type,
    props: normalizedProps,
  };
}
