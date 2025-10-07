import KalmanFilter from 'kalmanjs';

export class SensorFusion {
  constructor() {
    // Independent 1D Kalman Filter for each channel
    this.filters = {
      z: new KalmanFilter({ R: 0.05, Q: 0.01 }),
      roll: new KalmanFilter({ R: 0.05, Q: 0.01 }),
      pitch: new KalmanFilter({ R: 0.05, Q: 0.01 }),
      yaw: new KalmanFilter({ R: 0.05, Q: 0.01 })
    };
    this.enabled = false;
    this.alphaAccel = 0.0; // reserved for accel fusion (not present yet)
  }

  setEnabled(v) {
    this.enabled = !!v;
  }

  reset() {
    // kalmanjs has no reset; re-create filters
    this.filters.z = new KalmanFilter({ R: 0.05, Q: 0.01 });
    this.filters.roll = new KalmanFilter({ R: 0.05, Q: 0.01 });
    this.filters.pitch = new KalmanFilter({ R: 0.05, Q: 0.01 });
    this.filters.yaw = new KalmanFilter({ R: 0.05, Q: 0.01 });
  }

  // apply filtering to raw measurements
  filter({ z, roll, pitch, yaw }) {
    if (!this.enabled) {
      return { z, roll, pitch, yaw };
    }
    return {
      z: this.filters.z.filter(z || 0),
      roll: this.filters.roll.filter(roll || 0),
      pitch: this.filters.pitch.filter(pitch || 0),
      yaw: this.filters.yaw.filter(yaw || 0)
    };
  }
}


