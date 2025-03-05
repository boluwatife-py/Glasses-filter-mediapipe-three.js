import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import WebGL from "three/addons/capabilities/WebGL.js";

const createLoadingIndicator = () => {
  const div = document.createElement("div");
  div.classList.add("loader");
  div.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 1.2rem;
    padding: 15px 25px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    z-index: 1000;
    transition: opacity 0.3s;
  `;
  return div;
};

const initializeViewer = (modelPath) => {
  const portal = document.getElementById("bg");
  const overlay = document.getElementById("viewer-overlay");

  if (!portal || !overlay) {
    console.error("Required DOM elements missing");
    return;
  }

  if (!WebGL.isWebGL2Available()) {
    alert(WebGL.getWebGL2ErrorMessage());
    return;
  }

  const scene1 = new THREE.Scene();


  const camera1 = new THREE.PerspectiveCamera(50, portal.clientWidth / portal.clientHeight, 0.1, 1000);
  camera1.position.set(0, 1, 3);
  camera1.lookAt(0, 0, 0);

  const renderer1 = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer1.setPixelRatio(window.devicePixelRatio);
  renderer1.setSize(portal.clientWidth, portal.clientHeight);
  renderer1.shadowMap.enabled = true;
  renderer1.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer1.toneMapping = THREE.ACESFilmicToneMapping;
  renderer1.outputEncoding = THREE.sRGBEncoding;


  const onResize = () => {
    camera1.aspect = portal.clientWidth / portal.clientHeight;
    camera1.updateProjectionMatrix();
    renderer1.setSize(portal.clientWidth, portal.clientHeight);
  };
  window.addEventListener("resize", onResize);

  
  const addLights = (scene) => {
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambient);

    // const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    // dirLight.position.set(5, 10, 5);
    // dirLight.castShadow = true;
    // dirLight.shadow.mapSize.set(2048, 2048);
    // dirLight.shadow.camera.near = 0.1;
    // dirLight.shadow.camera.far = 50;
    // dirLight.shadow.bias = -0.0001;
    // scene.add(dirLight);

    
    // const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    // hemiLight.position.set(0, 20, 0);
    // scene.add(hemiLight);

    // const fillLight = new THREE.PointLight(0xffffff, 1.0, 1);
    // fillLight.position.set(-5, 5, -5);
    // scene.add(fillLight);

    
    // const interiorLight = new THREE.PointLight(0xffffff, 0.1, 6);
    // interiorLight.position.set(0, 0.5, 0);
    // scene.add(interiorLight);
  };

  addLights(scene1);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.ShadowMaterial({ opacity: 0.2 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene1.add(ground.clone());

  const loader = new GLTFLoader();
  const loadingIndicator = createLoadingIndicator();
  portal.appendChild(loadingIndicator);

  loader.load(
    modelPath,
    (gltf) => {
      const model1 = gltf.scene.clone();

      const normalizeModel = (model) => {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.1 / maxDim;
        model.scale.set(scale, scale, scale);
        model.position.sub(center.multiplyScalar(scale));
        model.rotation.set(0, 0, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              if (!(child.material instanceof THREE.MeshStandardMaterial)) {
                child.material = new THREE.MeshStandardMaterial({
                  color: child.material.color || 0xffffff,
                  metalness: 0.3,
                  roughness: 0.6,
                  envMapIntensity: 1.0,
                });
              }

              child.material.emissive = new THREE.Color(0x050505);
              child.material.ambientIntensity = 1.0;
              child.material.side = THREE.DoubleSide;
            }
          }
        });
      };

      normalizeModel(model1);

      scene1.add(model1);

      const animatePortal = () => {
        requestAnimationFrame(animatePortal);
        model1.rotation.y += 0.01;
        renderer1.render(scene1, camera1);
      };

      animatePortal();
      

      portal.appendChild(renderer1.domElement);
      loadingIndicator.style.opacity = "0";
      if (loadingIndicator.parentNode) loadingIndicator.parentNode.removeChild(loadingIndicator);
    },
    (xhr) => {
      const percent = Math.round((xhr.loaded / xhr.total) * 100);
      loadingIndicator.textContent = `Loading... ${percent}%`;
    },
    (error) => {
      console.error("Loading failed:", error);
      loadingIndicator.textContent = "Error: Could not load model";
      loadingIndicator.style.background = "rgba(255, 0, 0, 0.8)";
      if (loadingIndicator.parentNode) loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  );

  const closeButton = document.querySelector(".viewer-overlay .close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      overlay.classList.remove("opened");
    });
  }
  portal.addEventListener("click", () => {
    overlay.classList.add("opened");
  });
};

initializeViewer("/3d/black-glasses/glasses.glb");

document.head.insertAdjacentHTML("beforeend", `
  <style>
    #viewer-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 1000;
    }
    #viewer-overlay.opened {
      opacity: 1;
      pointer-events: auto;
    }
    #viewer-overlay .close {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    #bg {
      cursor: pointer;
    }
  </style>
`);