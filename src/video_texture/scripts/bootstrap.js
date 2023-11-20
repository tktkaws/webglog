import world from "./glsl/world";
import { viewport } from "./helper";
import scroller from "./component/scroller";
import mouse from "./component/mouse";
import loader from "./component/loader";

export async function init() {
  const canvas = document.querySelector("#canvas");
  viewport.init(canvas);

  scroller.init();

  loader.init();

  const loaderPercent = document.querySelector('.loader-percent');
  
  loader.addProgressAction((progress, total) => {
    loaderPercent.innerHTML = Math.round((progress/total) * 100) + "%";
    console.log(progress, total);
  });

  await loader.loadAllAssets();

  world.init(canvas, viewport);

  mouse.init();

  world.render();

  loader.letsBegin();
}




