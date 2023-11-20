import gsap from "gsap";
import Scrollbar from "smooth-scrollbar";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const scroller = {
  init,
};

function init() {
  gsap.registerPlugin(ScrollTrigger);

  const pageContainer = document.querySelector("#page-container");

  const scrollBar = Scrollbar.init(pageContainer, { delegateTo: document });

  ScrollTrigger.scrollerProxy(pageContainer, {
    scrollTop(value) {
      if (arguments.length) {
        scrollBar.scrollTop = value; // setter
      }
      return scrollBar.scrollTop; // getter
    },
    // getBoundingClientRect() {
    //   return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
    // }
  });

  scrollBar.addListener(ScrollTrigger.update);

  ScrollTrigger.defaults({
    scroller: pageContainer,
  });

  const el = document.querySelector("[data-webgl]");
}

export default scroller;
