import * as THREE from 'three';
import { FaceMask } from './face_mask';
import { Glasses } from './glasses';
import { VideoBackground } from './video_bg';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const cameraDistance = (height, fov) => {
  return (height / 2) / Math.tan((fov / 2) * Math.PI / 180);
};

export class SceneManager {
  constructor(canvas, debug = false, useOrtho = true) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.debug = debug;
    this.useOrtho = useOrtho;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      devicePixelRatio: window.devicePixelRatio || 1
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.fov = 63;
    this.buildVideoBg();
    this.buildCamera();
    this.buildControls();
    this.buildLighting();
    this.buildFaceMask();
    this.buildGlasses();
  }

  buildLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0.2, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
  }

  buildVideoBg() {
    this.videoBg = new VideoBackground(
      this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  buildFaceMask() {
    this.faceMask = new FaceMask(
      this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  buildGlasses() {
    this.glasses = new Glasses(
      this.scene,
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
  }

  buildControls() {
    if (this.debug) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.update();
    }
  }

  buildCamera() {
    this.useOrtho ? this.buildOrthoCamera() : this.buildPerspectiveCamera();
  }

  buildOrthoCamera() {
    this.camera = new THREE.OrthographicCamera(
      -this.renderer.domElement.width / 2,
      this.renderer.domElement.width / 2,
      this.renderer.domElement.height / 2,
      -this.renderer.domElement.height / 2,
      -2000,
      2000
    );
    this.camera.position.z = 1;
  }

  buildPerspectiveCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      this.renderer.domElement.width / this.renderer.domElement.height,
      1.0,
      10000
    );
    this.camera.position.z = cameraDistance(this.renderer.domElement.height, this.fov);
  }

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = this.videoWidth || canvas.clientWidth;
    const height = this.videoHeight || canvas.clientHeight;

    if (width != canvas.clientWidth || height != canvas.clientHeight) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const renderWidth = width | 0;
    const renderHeight = height | 0;
    const needResize = canvas.width !== renderWidth || canvas.height !== renderHeight;
    if (needResize) {
      this.renderer.setSize(renderWidth, renderHeight, false);
      this.faceMask.updateDimensions(renderWidth, renderHeight);
      this.glasses.updateDimensions(renderWidth, renderHeight);
      this.videoBg.updateDimensions(renderWidth, renderHeight);
      this.updateCamera();
    }
    return needResize;
  }

  updateCamera() {
    const width = this.videoWidth || this.renderer.domElement.width;
    const height = this.videoHeight || this.renderer.domElement.height;
    this.camera.aspect = width / height;
    if (this.camera.type == 'OrthographicCamera') {
      this.camera.top = height / 2;
      this.camera.bottom = -height / 2;
      this.camera.left = -width / 2;
      this.camera.right = width / 2;
    } else {
      this.camera.position.z = cameraDistance(height, this.fov);
    }
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.controls) {
      this.controls.update();
    }

    this.resizeRendererToDisplaySize();
    this.videoBg.update();
    this.faceMask.update();
    this.glasses.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize(videoWidth, videoHeight) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
  }

  onLandmarks(image, landmarks) {
    if (image && landmarks) {
      this.videoBg.setImage(image);
      this.faceMask.updateLandmarks(landmarks);
      this.glasses.updateLandmarks(landmarks);
    }
  }
}