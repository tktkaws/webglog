import world from "./glsl/world";
import { viewport } from "./helper";
import scroller from "./component/scroller";
import mouse from "./component/mouse";
import loader from "./component/loader";

export async function init() {
  const canvas = document.querySelector("#canvas");
  viewport.init(canvas);

  scroller.init();

  await loader.loadAllAssets();

  world.init(canvas, viewport);

  mouse.init();

  world.render();
}




