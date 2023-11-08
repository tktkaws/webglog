import world from "./glsl/world";
import { viewport } from "./helper";
import scroller from "./component/scroller";
import mouse from "./component/mouse";

export function init() {
  const canvas = document.querySelector("#canvas");
  viewport.init(canvas);

  scroller.init();

  world.init(canvas, viewport);

  mouse.init();

  world.render();
}




