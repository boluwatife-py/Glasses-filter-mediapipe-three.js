import "./styles.css";
import { CameraFrameProvider } from './js/camera_frame_provider';
import { FacemeshLandmarksProvider } from './js/facemesh/landmarks_provider';
import { SceneManager } from "./js/three_components/scene_manager";

const template = `
<div class="video-container">
  <span class="loader">
    Loading ...
  </span>
  <div>
    <h2>Processed Video</h2>
    <canvas class="output_canvas"></canvas>
  </div>
  <video class="input_video" style="display: none;" playsinline></video>
</div>
`;

document.querySelector("#app").innerHTML = template;

async function main() {
  document.querySelector(".video-container").classList.add("loading");

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
    sceneManager.resize(window.innerWidth, window.innerHeight);
    sceneManager.animate();
  }

  sceneManager = new SceneManager(canvas, debug, useOrtho);
  facemeshLandmarksProvider = new FacemeshLandmarksProvider(onLandmarks);

  // Use camera directly (no video file)
  videoFrameProvider = new CameraFrameProvider(video, onFrame);

  await facemeshLandmarksProvider.initialize();
  videoFrameProvider.start();

  animate();

  document.querySelector(".video-container").classList.remove("loading");
}

main();