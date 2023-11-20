import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  Raycaster,
  Vector2,
  Vector4,
} from "three";

import { utils, viewport } from "../helper";
import mouse from "../component/mouse";
import loader from "../component/loader";

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

async function _initObj(viewport) {
  const els = document.querySelectorAll("[data-webgl]");
  const prms = [...els].map(async (el) => {
    
    const texes = await loader.getTexByElement(el);
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
        uniform vec4 uResolution;
        uniform float uHover;
        uniform sampler2D tex1;
        uniform sampler2D tex2;

        vec2 coverUv(vec2 uv, vec4 resolution) {
          return (uv - .5) * resolution.zw + .5;
        }

        void main() {
          // vec2 mouse = step(uMouse, vUv);
          // gl_FragColor = vec4(mouse, uHover, 1.);

          vec2 uv = coverUv(vUv, uResolution);

          vec4 t1 = texture2D(tex1, uv);
          vec4 t2 = texture2D(tex2, uv);
          vec4 color = mix(t1, t2, step(.5, uv.x));
          gl_FragColor = t2;
        }
      `,
      uniforms: {
        uMouse: { value: new Vector2(0.5, 0.5) },
        uHover: { value: 0 },
      },
    });

    function setupResolution(uniforms) {
      if(!texes.get("tex1")) return uniforms;

      const media = texes.get("tex1").source.data;
      
      const mediaRect = {
        width: media.naturalWidth,
        height: media.naturalHeight
      }

      const resolution = getResolutionUniform(rect, mediaRect);
      uniforms.uResolution = { value: resolution };

      return uniforms;
    }

    function getResolutionUniform(toRect, mediaRect) {

      const { width: toW, height: toH } = toRect;
      const resolution = new Vector4(toW, toH, 1, 1);

      if(!mediaRect) return resolution;

      const { width: mediaW, height: mediaH } = mediaRect;

      const mediaAspect = mediaH / mediaW;
      const toAspect = toH / toW;

      let xAspect, yAspect;
      if(toAspect > mediaAspect) {
        xAspect = 1 / toAspect * mediaAspect;
        yAspect = 1;
      } else {
        xAspect = 1;
        yAspect = toAspect / mediaAspect;
      }

      resolution.z = xAspect;
      resolution.w = yAspect;
      return resolution;
    }

    material.uniforms = setupResolution(material.uniforms);

    texes.forEach((tex, key) => {
      material.uniforms[key] = { value: tex };
    });

    const mesh = new Mesh(geometry, material);
    mesh.position.z = 0;

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
    return o;
  });

  await Promise.all(prms);

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
