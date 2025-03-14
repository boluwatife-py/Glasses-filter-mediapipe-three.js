import * as THREE from 'three';
import { Glasses } from './glasses';
import { VideoBackground } from './video_bg';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { log } from 'three/tsl';

/**
 * Finds distance to position perspective camera
 * @param {Number} height height of video
 * @param {Number} fov fov of perspective camera
 */
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
      devicePixelRatio: window.devicePixelRatio || 1,
      alpha: true // Ensure transparency for video background
    });
    this.fov = 63;
    this.buildCamera();
    this.buildControls();
    this.buildLighting(); // Add lighting
    this.buildVideoBg();
    this.buildGlasses();
    window.addEventListener("resize", () => this.resize(), false);
  }

  buildLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light, 50% intensity
    this.scene.add(ambientLight);


    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 1).normalize();
    this.scene.add(directionalLight);


    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, -1, -1).normalize();
    this.scene.add(backLight);
  }

  buildVideoBg() {
    this.videoBg = new VideoBackground(
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
      1000
    );
    this.camera.position.z = cameraDistance(this.renderer.domElement.height, this.fov);
  }

  resizeRendererToDisplaySize() {
    const canvas = this.renderer.domElement;
    const width = this.videoWidth;
    const height = this.videoHeight;

    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, true);

    }
    return needResize;
  }



  updateCamera() {
    this.camera.aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    if (this.camera.type === 'OrthographicCamera') {
      this.camera.top = this.videoHeight / 2;
      this.camera.bottom = -this.videoHeight / 2;
      this.camera.left = -this.videoWidth / 2;
      this.camera.right = this.videoWidth / 2;
    } else {
      this.camera.position.z = cameraDistance(this.videoHeight, this.fov);
    }
    this.camera.updateProjectionMatrix();
  }

  animate() {
    if (this.controls) {
      this.controls.update();
    }

    if (this.resizeRendererToDisplaySize()) {
      this.glasses.updateDimensions(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      );
      this.videoBg.updateDimensions(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      );
      this.updateCamera();
    }

    this.videoBg.update();
    this.glasses.update();
    this.renderer.render(this.scene, this.camera);
  }

  resize(videoWidth, videoHeight) {
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
  }


  onLandmarks(image, landmarks) {
    if (image) {
      this.videoBg.setImage(image);
    }
    if(landmarks){
      this.glasses.updateLandmarks(landmarks);
    }else{
      this.glasses.removeGlasses()
    }
  }
}