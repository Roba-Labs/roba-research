export class SimRecorder {
  constructor(demo) {
    this.demo = demo;
    this.recording = false;
    this.frames = [];
    this.metadata = {
      scene: null,
      timestep: 0,
      startedAt: 0,
      version: 1
    };
  }

  start() {
    const model = this.demo?.model;
    this.frames.length = 0;
    this.recording = true;
    this.metadata.scene = this.demo?.params?.scene || '';
    this.metadata.timestep = model?.getOptions?.().timestep || 0;
    this.metadata.startedAt = Date.now();
  }

  stop() {
    this.recording = false;
  }

  captureFrame() {
    if (!this.recording) return;
    const sim = this.demo?.simulation;
    if (!sim) return;

    const frame = {
      t: performance.now(),
      qpos: sim.qpos ? Array.from(sim.qpos) : [],
      qvel: sim.qvel ? Array.from(sim.qvel) : [],
      ctrl: sim.ctrl ? Array.from(sim.ctrl) : []
    };
    this.frames.push(frame);
  }

  toJSON() {
    return JSON.stringify({ metadata: this.metadata, frames: this.frames });
  }

  download(filename = `recording_${Date.now()}.json`) {
    try {
      const blob = new Blob([this.toJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download recording', err);
    }
  }

  loadFromText(text) {
    const data = JSON.parse(text);
    this.metadata = data?.metadata || {};
    this.frames = Array.isArray(data?.frames) ? data.frames : [];
  }
}

export class SimPlayback {
  constructor(demo) {
    this.demo = demo;
    this.active = false;
    this.frames = [];
    this.index = 0;
    this.speed = 1.0; // 1x speed
  }

  loadFrames(frames) {
    this.frames = Array.isArray(frames) ? frames : [];
    this.index = 0;
  }

  start() {
    if (!this.frames || this.frames.length === 0) return;
    this.index = 0;
    this.active = true;
  }

  stop() {
    this.active = false;
  }

  setSpeed(mult) {
    this.speed = Math.max(0.1, Math.min(5.0, Number(mult) || 1.0));
  }

  stepOnce() {
    if (!this.active || !this.frames || this.frames.length === 0) return;
    const frame = this.frames[this.index];
    const sim = this.demo?.simulation;
    if (!sim || !frame) return;

    if (frame.qpos && sim.qpos && sim.qpos.length === frame.qpos.length) {
      sim.qpos.set(frame.qpos);
    }
    if (frame.qvel && sim.qvel && sim.qvel.length === frame.qvel.length) {
      sim.qvel.set(frame.qvel);
    }
    if (frame.ctrl && sim.ctrl && sim.ctrl.length === frame.ctrl.length) {
      sim.ctrl.set(frame.ctrl);
    }
    try {
      this.demo.simulation.forward();
    } catch (e) {
      // ignore
    }

    // advance index with speed (can skip frames)
    const step = Math.max(1, Math.round(this.speed));
    this.index = (this.index + step) % this.frames.length;
  }
}


