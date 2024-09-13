import sourceMapSupport from "source-map-support";
sourceMapSupport.install();

import mount from "./mount/index.js";
import childComponent from "./child-component/index.js";
import stateful from "./state/index.js";
import flatten from "./flatten.js";

mount();
childComponent();
stateful();
flatten();
