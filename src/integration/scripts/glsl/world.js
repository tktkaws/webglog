import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Raycaster,
  Vector2,
} from "three";

import { utils, viewport } from "../helper";
import mouse from "../component/mouse";

const world = {
  os: [],
  raycaster: new Raycaster(),
  init,
  adjustWorldPosition,
  render,
};

function init(canvas, viewport) {
  world.renderer = new WebGLRenderer({
    canvas,
    antialias: true,
  });
  world.renderer.setSize(viewport.width, viewport.height, false);
  world.renderer.setPixelRatio(viewport.devicePixelRatio);
  world.renderer.setClearColor(0x000000, 0);

  world.scene = new Scene();

  world.camera = _setupPerspectiveCamera(viewport);

  _initObj(viewport);
}

function _initObj(viewport) {
  const els = document.querySelectorAll("[data-webgl]");
  els.forEach((el) => {
    const rect = el.getBoundingClientRect();

    const geometry = new PlaneGeometry(rect.width, rect.height, 1, 1);
    // const material = new MeshBasicMaterial({
    //   color: 0xff0000,
    //   transparent: true,
    //   opacity: 0.3,
    // });
    const material = new ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec2 uMouse;
        uniform float uHover;

        void main() {
          vec2 mouse = step(uMouse, vUv);
          gl_FragColor = vec4(mouse, uHover, 1.);
        }
      `,
      uniforms: {
        uMouse: { value: new Vector2(0.5, 0.5) },
        uHover: { value: 0 },
      },
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.z = 0;

    // const { x, y } = getWorldPosition(rect, canvasRect);
    // mesh.position.x = x;
    // mesh.position.y = y;

    const o = {
      mesh,
      geometry,
      material,
      rect,
      $: {
        el,
      },
    };

    world.scene.add(mesh);
    world.os.push(o);
  });

  adjustWorldPosition(viewport);
}

function _setupPerspectiveCamera(viewport) {
  const { fov, aspect, near, far, cameraZ } = viewport;
  const camera = new PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = cameraZ;
  return camera;
}

function adjustWorldPosition(viewport) {
  // canvasサイズの変更
  world.renderer.setSize(viewport.width, viewport.height, false);

  // meshの位置とサイズの変更
  world.os.forEach((o) => resize(o, viewport));

  // cameraのProjectionMatrixの変更
  updateCamera(viewport);
}

function resize(o, newCanvasRect) {
  const {
    $: { el },
    mesh,
    geometry,
    rect,
  } = o;
  const nextRect = el.getBoundingClientRect();
  const { x, y } = getWorldPosition(nextRect, newCanvasRect);
  mesh.position.x = x;
  mesh.position.y = y;

  // 大きさの変更
  geometry.scale(nextRect.width / rect.width, nextRect.height / rect.height, 1);

  o.rect = nextRect;
}

function getWorldPosition(rect, canvasRect) {
  const x = rect.left + rect.width / 2 - canvasRect.width / 2;
  const y = -rect.top - rect.height / 2 + canvasRect.height / 2;
  return { x, y };
}

function updateCamera(viewport) {
  const { fov, aspect, near, far } = viewport;
  world.camera.fov = fov;
  world.camera.aspect = aspect;
  world.camera.near = near;
  world.camera.far = far;
  world.camera.updateProjectionMatrix();
  return world.camera;
}

function render() {
  requestAnimationFrame(render);
  // スクロール処理
  world.os.forEach((o) => scroll(o));

  // レイキャスティング
  raycast();

  world.renderer.render(world.scene, world.camera);
}

function scroll(o) {
  const {
    $: { el },
    mesh,
  } = o;
  const rect = el.getBoundingClientRect();
  const { x, y } = getWorldPosition(rect, viewport);
  // mesh.position.x = x;
  mesh.position.y = y;
}

function raycast() {
  const clipPos = mouse.getClipPos();
  world.raycaster.setFromCamera(clipPos, world.camera);

  // calculate objects intersecting the picking ray
  const intersects = world.raycaster.intersectObjects(world.scene.children);
  const intersect = intersects[0];

  for (let i = 0; i < world.scene.children.length; i++) {
    const _mesh = world.scene.children[i];

    const uHover = _mesh.material.uniforms.uHover;
    if (intersect?.object === _mesh) {
      _mesh.material.uniforms.uMouse.value = intersect.uv;
      uHover.__endValue = 1;
    } else {
      uHover.__endValue = 0;
    }

    uHover.value = utils.lerp(uHover.value, uHover.__endValue, 0.1);
  }
}
export default world;
