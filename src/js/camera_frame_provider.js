import { Camera } from '@mediapipe/camera_utils';

const overlay = document.getElementById("viewer-overlay");
export class CameraFrameProvider {
  constructor(videoElement, onFrame) {
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        onFrame(videoElement)
      },
      width: overlay.clientWidth,
      height: overlay.clientHeight
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