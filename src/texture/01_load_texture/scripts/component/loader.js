import { LinearFilter, TextureLoader } from "three";

const textureCache = new Map();
const texLoader = new TextureLoader();

window.textureCache = textureCache;

const loader = {
    loadAllAssets,
    loadImg,
    getTexByElement
}

async function loadAllAssets() {
  const els = document.querySelectorAll("[data-webgl]");
  for (const el of els) {
    const data = el.dataset;
    for (let key in data) {
      if (!key.startsWith("tex")) continue;

      const url = data[key];
      if (!textureCache.has(url)) {
        textureCache.set(url, null);
      }
    }
  }

  const texPrms = [];
  
  textureCache.forEach((_, url) => {
    const prms = loadImg(url).then(tex => {
        textureCache.set(url, tex);
    });
    
    texPrms.push(prms);
  });

  await Promise.all(texPrms);

}

async function loadImg(url) {
    const tex = await texLoader.loadAsync(url);
    tex.magFilter = LinearFilter;
    tex.minFilter = LinearFilter;
    tex.needsUpdate = false;
    return tex;
}

function getTexByElement(el) {
    const texes = new Map;
    const data = el.dataset;

    for(let key in data) {
      if(!key.startsWith("tex")) continue;

      const url = data[key];
      const tex = textureCache.get(url);

      key = key.replace("-", ""); 
      
      texes.set(key, tex);
    }

    return texes;
}

export default loader;