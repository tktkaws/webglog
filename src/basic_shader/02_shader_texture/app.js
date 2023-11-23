/**
 * Three.js
 * https://threejs.org/
 */
import * as THREE from "three";

init();
async function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* エラー時にシェーダの全体のコードを表示(three.js 0.152.0 対応) */
  renderer.debug.onShaderError = (
    gl,
    program,
    vertexShader,
    fragmentShader
  ) => {
    const vertexShaderSource = gl.getShaderSource(vertexShader);
    const fragmentShaderSource = gl.getShaderSource(fragmentShader);

    console.groupCollapsed("vertexShader");
    console.log(vertexShaderSource);
    console.groupEnd();

    console.groupCollapsed("fragmentShader");
    console.log(fragmentShaderSource);
    console.groupEnd();
  };

  document.body.appendChild(renderer.domElement);

  async function loadTex(url) {
    const texLoader = new THREE.TextureLoader();
    const texture = await texLoader.loadAsync(url);
    return texture;
  }

  const geometry = new THREE.PlaneGeometry(40, 20);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTex: { value: await loadTex("/img/uv.jpg") },
    },
    vertexShader: `
       varying vec2 vUv;

       void main() {
         vUv = uv;
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
       }
     `,
    fragmentShader: `
       varying vec2 vUv;
       uniform sampler2D uTex;

       void main() {
         vec4 texColor = texture(uTex, vUv);
         gl_FragColor = texColor;
       }
     `,
  });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  console.log(geometry);

  camera.position.z = 30;

  let i = 0;
  function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x = cube.rotation.x + 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
  }

  animate();
}
