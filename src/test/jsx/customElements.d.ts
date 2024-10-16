// File path: ./src/index.tsx

import "../../index.ts";

declare module "../../index.js" {
  namespace JSX {
    interface IntrinsicElements {
      "my-jsx-element": {
        title?: string;
        count?: number;
      };
      "nested-element": {
        label?: string;
        value?: string;
      };
      "parent-element": {
        title?: string;
        count?: number;
        children?: any;
      };
      "clickable-element": {
        onclick?: (event: Event) => void;
      };
      "dynamic-render-element": {
        title?: string;
        count?: number;
      };
      "my-slot-element": {
        title?: string;
        children?: any;
      };
      "named-slot-element": {};
      "my-custom-slot-element": {
        children?: any;
      };
      "my-dynamic-slot-element": {
        children?: any;
      };
      "multi-slot-element": {
        children?: any;
      };
    }
  }
}
