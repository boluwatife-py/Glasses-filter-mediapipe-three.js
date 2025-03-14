import { Camera } from '@mediapipe/camera_utils';

export class CameraFrameProvider {
  constructor(videoElement, onFrame, width, height) {
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        onFrame(videoElement)
      },
      width: width,
      height: height
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