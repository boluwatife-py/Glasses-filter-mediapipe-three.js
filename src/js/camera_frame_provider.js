import { Camera } from '@mediapipe/camera_utils';

const overlay = document.getElementById("viewer-overlay");

export class CameraFrameProvider {
  constructor(videoElement, onFrame) {
    // Check if the camera is front-facing (user-facing)
    const isFrontCamera = true; // You may need to detect this dynamically (see note below)
    
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        onFrame(videoElement);
      },
      width: overlay.clientWidth, // Use overlay width
      height: overlay.clientHeight, // Use overlay height
      facingMode: isFrontCamera ? 'user' : 'environment', // 'user' for front camera, 'environment' for back camera
      mirror: isFrontCamera ? false : true, // Disable mirroring for front camera, enable for back camera
    });
    this.camera = camera;
  }

  start() {
    this.camera.start();
  }

  stop() {
    this.camera.stop();
  }
}