export class CanvasVideoRecorder {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.chunks = [];
    this.options = Object.assign({ mimeType: 'video/webm; codecs=vp9' }, options);
    this.active = false;
  }

  start(fps = 60) {
    if (!this.canvas || this.active) return;
    const stream = this.canvas.captureStream(fps);
    try {
      this.mediaRecorder = new MediaRecorder(stream, this.options);
    } catch (e) {
      console.warn('Falling back to default MediaRecorder options', e);
      this.mediaRecorder = new MediaRecorder(stream);
    }
    this.chunks = [];
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.mediaRecorder.onstop = () => {
      this._download();
    };
    this.mediaRecorder.start();
    this.active = true;
  }

  stop() {
    if (!this.mediaRecorder || !this.active) return;
    this.active = false;
    try { this.mediaRecorder.stop(); } catch (e) { /* ignore */ }
  }

  _download() {
    try {
      const blob = new Blob(this.chunks, { type: this.options.mimeType || 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mujoco_recording_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to save video', err);
    }
  }
}


