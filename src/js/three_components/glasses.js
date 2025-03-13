import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scaleLandmark } from '../facemesh/landmarks_helpers';

function loadModel(file) {
  return new Promise((res, rej) => {
    const loader = new GLTFLoader();
    loader.load(file, (gltf) => res(gltf.scene), undefined, (error) => rej(error));
  });
}

export class Glasses {
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.needsUpdate = false;
    this.landmarks = null;
    this.glasses = null;
    this.loadGlasses();
  }

  async loadGlasses() {
    this.glasses = await loadModel('/3d/glasses/glasses.glb');
    const bbox = new THREE.Box3().setFromObject(this.glasses);
    const size = bbox.getSize(new THREE.Vector3());
    this.scaleFactor = size.x;
    this.glasses.name = 'glasses';
    this.glasses.traverse((child) => {
      if (child.isMesh) child.castShadow = true; // Ready for shadows
    });
  }

  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
    this.needsUpdate = true;
  }

  updateLandmarks(landmarks) {
    this.landmarks = landmarks;
    this.needsUpdate = true;
  }

  updateGlasses() {
    if (!this.glasses || !this.landmarks) return;

    let midEyes = scaleLandmark(this.landmarks[6], this.width, this.height);
    let leftEyeInnerCorner = scaleLandmark(this.landmarks[463], this.width, this.height);
    let rightEyeInnerCorner = scaleLandmark(this.landmarks[243], this.width, this.height);
    let noseBottom = scaleLandmark(this.landmarks[2], this.width, this.height);
    let leftEyeUpper1 = scaleLandmark(this.landmarks[356], this.width, this.height);
    let rightEyeUpper1 = scaleLandmark(this.landmarks[127], this.width, this.height);

    this.glasses.position.set(midEyes.x, midEyes.y, midEyes.z);

    const eyeDist = Math.sqrt(
      (leftEyeUpper1.x - rightEyeUpper1.x) ** 2 +
      (leftEyeUpper1.y - rightEyeUpper1.y) ** 2 +
      (leftEyeUpper1.z - rightEyeUpper1.z) ** 2
    );
    const scale = eyeDist / this.scaleFactor;
    this.glasses.scale.set(scale, scale, scale);

    let upVector = new THREE.Vector3(
      midEyes.x - noseBottom.x,
      midEyes.y - noseBottom.y,
      midEyes.z - noseBottom.z
    ).normalize();

    let sideVector = new THREE.Vector3(
      leftEyeInnerCorner.x - rightEyeInnerCorner.x,
      leftEyeInnerCorner.y - rightEyeInnerCorner.y,
      leftEyeInnerCorner.z - rightEyeInnerCorner.z
    ).normalize();

    let zRot = new THREE.Vector3(1, 0, 0).angleTo(
      upVector.clone().projectOnPlane(new THREE.Vector3(0, 0, 1))
    ) - Math.PI / 2;

    let xRot = Math.PI / 2 - new THREE.Vector3(0, 0, 1).angleTo(
      upVector.clone().projectOnPlane(new THREE.Vector3(1, 0, 0))
    );

    let yRot = new THREE.Vector3(sideVector.x, 0, sideVector.z).angleTo(
      new THREE.Vector3(0, 0, 1)
    ) - Math.PI / 2;

    this.glasses.rotation.set(xRot, yRot, zRot);
  }

  addGlasses() {
    if (this.glasses && !this.scene.getObjectByName('glasses')) {
      this.scene.add(this.glasses);
    }
  }

  removeGlasses() {
    if (this.glasses) {
      this.scene.remove(this.glasses);
    }
  }

  update() {
    if (this.needsUpdate && this.glasses) {
      const shouldShow = !!this.landmarks;
      const inScene = !!this.scene.getObjectByName('glasses');
      if (shouldShow) {
        this.updateGlasses();
        if (!inScene) this.addGlasses();
      } else if (inScene) {
        this.removeGlasses();
      }
      this.needsUpdate = false;
    }
  }
}