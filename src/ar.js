// import "./styles.css";
import { CameraFrameProvider } from './js/camera_frame_provider';
import { FacemeshLandmarksProvider } from './js/facemesh/landmarks_provider';
import { SceneManager } from "./js/three_components/scene_manager";

const overlay = document.getElementById("viewer-overlay");
const overlayLoader = document.querySelector(".loader-over"); // Loader element

async function main() {
  console.log("Initializing AR...");

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
      console.error("Camera not supported on this device", e);
      alert("Not Supported on your device");
      videoFrameProvider.stop();
    }
  };

  function animate() {
    requestAnimationFrame(animate);
    sceneManager.resize(overlay.clientWidth, overlay.clientHeight);
    sceneManager.animate();
  }

  try {
    console.log("Setting up SceneManager...");
    sceneManager = new SceneManager(canvas, debug, useOrtho);

    console.log("Initializing FaceMesh...");
    facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);
    await facemeshLandmarksProvider.initialize();

    console.log("Starting Camera...");
    videoFrameProvider = new CameraFrameProvider(video, onFrame);
    videoFrameProvider.start();

    overlayLoader.style.display = 'none';
    animate();
  } catch (error) {
    console.error("Error initializing AR:", error);
  }
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
