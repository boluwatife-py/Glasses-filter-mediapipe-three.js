// import "./styles.css";
import { CameraFrameProvider } from './js/camera_frame_provider';
import { FacemeshLandmarksProvider } from './js/facemesh/landmarks_provider';
import { SceneManager } from "./js/three_components/scene_manager";

const overlay = document.getElementById("viewer-overlay");
async function main() {
  const video = document.querySelector('.input_video');
  const canvas = document.querySelector('.output_canvas');

  const useOrtho = true;
  const debug = false;

  let sceneManager;
  let facemeshLandmarksProvider;
  let videoFrameProvider;

  const onLandmarks = ({ image, landmarks }) => {
    sceneManager.onLandmarks(image, landmarks);
  };

  const onFrame = async (video) => {
    try {
      await facemeshLandmarksProvider.send(video);
    } catch (e) {
      alert("Not Supported on your device");
      console.error(e);
      videoFrameProvider.stop();
    }
  };

  function animate() {
    requestAnimationFrame(animate);
    sceneManager.resize(overlay.clientWidth, overlay.clientHeight);
    sceneManager.animate();
  }

  sceneManager = new SceneManager(canvas, debug, useOrtho);
  facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);

  // Use camera directly (no video file)
  videoFrameProvider = new CameraFrameProvider(video, onFrame);

  await facemeshLandmarksProvider.initialize();
  videoFrameProvider.start();

  animate();
}

let arInitialized = false;

const portal = document.getElementById("bg");
portal.addEventListener("click", () => {
  overlay.classList.add("opened");
  if (!arInitialized) {
    arInitialized = true;
    main();
  }
});