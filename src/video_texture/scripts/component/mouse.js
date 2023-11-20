import { Vector2 } from "three";

import { viewport } from "../helper";
const current = new Vector2();

const mouse = {
  current,
  init,
  getClipPos,
};

function init() {
  _bindEvents();
}

function _updatePosition(event) {
  current.x = event.clientX;
  current.y = event.clientY;
}

function getClipPos() {
  return {
    x: (current.x / viewport.width) * 2 - 1,
    y: -(current.y / viewport.height) * 2 + 1,
  };
}

function _bindEvents() {
  const globalContainer = document.querySelector("#global-container");
  globalContainer.addEventListener("pointermove", (event) => {
    _updatePosition(event);
  });
}

export default mouse;
