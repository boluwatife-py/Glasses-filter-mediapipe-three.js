export class CameraFrameProvider {
  constructor(videoElement, onFrame) {
    this.videoElement = videoElement;
    this.onFrame = onFrame;
    this.stream = null;
    // Default to front camera
    this.isFrontCamera = true; // You may need to detect this dynamically

    // Bind the methods
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.handleFrame = this.handleFrame.bind(this);

    // Request animation frame ID
    this.rafId = null;
  }

  async start() {
    try {

      const constraints = {
        video: {
          facingMode: this.isFrontCamera ? 'user' : 'environment',
          width: this.width,
          height: this.height
        }
      };


      this.stream = await navigator.mediaDevices.getUserMedia(constraints);


      this.videoElement.srcObject = this.stream;


      this.videoElement.style.transform = this.isFrontCamera ? 'scaleX(-1)' : 'scaleX(1)';


      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });
      this.handleFrame();
    } catch (error) {
      console.error('Error starting camera:', error);
      throw error;
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.videoElement.srcObject = null;
    this.videoElement.style.transform = 'scaleX(1)';
  }

  handleFrame() {
    if (this.stream) {
      this.onFrame(this.videoElement);
      this.rafId = requestAnimationFrame(this.handleFrame);
    }
  }

  
  async toggleCamera() {
    this.stop();
    this.isFrontCamera = !this.isFrontCamera;
    await this.start();
  }
}
