import * as THREE from 'three';
import { makeGeometry } from '../facemesh/landmarks_helpers';

export class FaceMask {
  constructor(scene, width, height) {
    this.scene = scene;
    this.needsUpdate = false;
    this.landmarks = null;
    this.faces = null;
    this.width = width;
    this.height = height;
    this.material = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa, // Gray for visibility without video
      side: THREE.DoubleSide
    });
    this.material.receiveShadow = true; // Ready for shadows
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

  updateMaterial(material) {
    this.material = material;
    this.material.needsUpdate = true;
    if (this.faces) this.faces.material = this.material;
  }

  initializeFaces() {
    if (!this.landmarks) return;
    const geometry = makeGeometry(this.landmarks);
    this.faces = new THREE.Mesh(geometry, this.material);
    this.faces.position.set(0, 0, 0);
    this.faces.scale.set(this.width, this.height, this.width);
    this.scene.add(this.faces);
  }

  updateFaces() {
    if (!this.faces) {
      this.initializeFaces();
    } else if (this.landmarks) {
      // Update existing geometry instead of recreating
      const positions = this.faces.geometry.attributes.position.array;
      for (let i = 0; i < this.landmarks.length; i++) {
        positions[i * 3] = this.landmarks[i].x;
        positions[i * 3 + 1] = this.landmarks[i].y;
        positions[i * 3 + 2] = this.landmarks[i].z;
      }
      this.faces.geometry.attributes.position.needsUpdate = true;
      this.faces.geometry.computeVertexNormals();
      this.faces.scale.set(this.width, this.height, this.width);
    }
  }

  removeFaces() {
    if (this.faces) {
      this.scene.remove(this.faces);
      this.faces.geometry.dispose();
      this.faces = null;
    }
  }

  update() {
    if (this.needsUpdate) {
      this.updateFaces();
      this.needsUpdate = false;
    }
  }
}