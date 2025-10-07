export class SineActuatorController {
  constructor(demo) {
    this.demo = demo;
    this.type = 'sine';
    this.time = 0;
    this.base = null;
    this.amp = null;
    this.phase = null;
  }

  onSceneActivated() {
    const demo = this.demo;
    if (!demo || !demo.simulation || !demo.model) {
      return;
    }
    if (demo.inputManager) {
      demo.inputManager.setEnabled(false);
      demo.inputManager.reset();
    }
    this._initWaveParams();
  }

  reset() {
    this.time = 0;
    this._initWaveParams();
  }

  dispose() {
    if (this.demo?.inputManager) {
      this.demo.inputManager.reset();
      this.demo.inputManager.setEnabled(false);
    }
  }

  _initWaveParams() {
    const { model, simulation } = this.demo;
    if (!model || !simulation) return;

    const nu = model.nu || (simulation.ctrl ? simulation.ctrl.length : 0);
    if (!Number.isFinite(nu) || nu <= 0) return;

    const ctrl = simulation.ctrl;
    const ranges = model.actuator_ctrlrange;

    this.base = new Float32Array(nu);
    this.amp = new Float32Array(nu);
    this.phase = new Float32Array(nu);

    const amplitudeScale = Number.isFinite(this.demo?.params?.sineAmplitudeScale)
      ? this.demo.params.sineAmplitudeScale
      : 0.25; // 25% of range by default

    for (let i = 0; i < nu; i++) {
      let lo = 0, hi = 1;
      if (ranges && ranges.length >= (i * 2 + 2)) {
        lo = ranges[i * 2 + 0];
        hi = ranges[i * 2 + 1];
      }
      const span = Math.max(0, hi - lo) || 1;
      this.base[i] = lo + span * 0.5;
      this.amp[i] = span * amplitudeScale;
      this.phase[i] = (Math.PI / 2) * i; // stagger phases for variety
      if (ctrl && i < ctrl.length) {
        ctrl[i] = this.base[i];
      }
    }
  }

  /**
   * Drive actuators with a sinusoidal wave.
   * @param {number} dt - MuJoCo timestep (seconds)
   * @param {number} nowMs - performance.now()
   */
  update(dt, nowMs) {
    const demo = this.demo;
    if (!demo || !demo.model || !demo.simulation) return;

    this.time += Math.max(0, dt);
    const ctrl = demo.simulation.ctrl;
    if (!ctrl || ctrl.length === 0 || !this.base || !this.amp) return;

    const freq = Number.isFinite(demo?.params?.sineFrequency) ? demo.params.sineFrequency : 0.5; // Hz
    const omega = 2 * Math.PI * freq;

    for (let i = 0; i < ctrl.length && i < this.base.length; i++) {
      const value = this.base[i] + this.amp[i] * Math.sin(omega * this.time + this.phase[i]);
      ctrl[i] = value;
    }
  }
}


