import * as THREE from 'three';

export class WaypointController {
  constructor(demo) {
    this.demo = demo;
    this.type = 'waypoints';
    this.currentIdx = 0;
    this.reachedThreshold = 0.2;
    this.speed = 1.0; // m/s ground speed
    this.altitude = 0.8; // target altitude
    this._dwellTimer = 0;
  }

  onSceneActivated() {
    if (this.demo?.inputManager) {
      this.demo.inputManager.setEnabled(false);
      this.demo.inputManager.reset();
    }
    this.reset();
  }

  reset() {
    this.currentIdx = 0;
  }

  dispose() {
    if (this.demo?.inputManager) {
      this.demo.inputManager.reset();
      this.demo.inputManager.setEnabled(false);
    }
  }

  update(dt) {
    const demo = this.demo;
    if (!demo || !demo.simulation || !demo.model) return;
    const qpos = demo.simulation.qpos;
    if (!qpos || qpos.length < 7) return;

    const wpMgr = demo.waypoints;
    const planned = demo.plannedPath && demo.plannedPath.length > 0 ? demo.plannedPath : null;
    const smoothed = (!planned && demo.smoothedPath && demo.smoothedPath.length > 0) ? demo.smoothedPath : null;
    const pathArray = planned || smoothed || (wpMgr && wpMgr.points) || [];
    if (!pathArray || pathArray.length === 0) return;

    const target = pathArray[Math.min(this.currentIdx, pathArray.length - 1)];
    const pos = new THREE.Vector3(qpos[0], qpos[2], -qpos[1]); // convert to scene axes used in code

    // desired on-ground vector from drone to target
    const targetOnGround = new THREE.Vector3(target.x, pos.y, target.z);
    const toTarget = new THREE.Vector3().subVectors(targetOnGround, pos);
    const dist = toTarget.length();

    if (dist < this.reachedThreshold) {
      // dwell/loiter
      this._dwellTimer += dt;
      if (this._dwellTimer >= ((wpMgr?.dwellSeconds) || 0)) {
        this._dwellTimer = 0;
        if (this.currentIdx + 1 < pathArray.length) {
          this.currentIdx += 1;
        } else if (wpMgr?.loop) {
          this.currentIdx = 0;
        }
      }
      // hold hover while dwelling
      this.demo.params.pidEnabled = true;
      this.demo.pidTarget.pitch = 0;
      this.demo.pidTarget.roll = 0;
      this.demo.pidTarget.alt = this.altitude;
      this.demo.updatePIDControl(performance.now());
      return;
    } else {
      this._dwellTimer = 0;
    }

    // Normalize to control pitch/roll setpoints toward the waypoint direction
    toTarget.normalize();
    // Simple guidance: map world axes to desired pitch/roll
    // pitch forward (x world), roll right (z world) heuristics
    // lookahead to reduce oscillations on smoothed path
    let lookahead = target.clone();
    if (smoothed) {
      const nextIdx = Math.min(pathArray.length - 1, this.currentIdx + 5);
      lookahead = pathArray[nextIdx].clone();
    }
    const toLook = new THREE.Vector3().subVectors(lookahead, pos).normalize();
    const desiredPitch = -Math.atan2(toLook.x, 1) * 0.3;
    const desiredRoll  =  Math.atan2(toLook.z, 1) * 0.3;

    // Feed setpoints into PID controller if available
    demo.params.pidEnabled = true;
    demo.pidTarget.pitch = THREE.MathUtils.clamp(desiredPitch, -20*Math.PI/180, 20*Math.PI/180);
    demo.pidTarget.roll  = THREE.MathUtils.clamp(desiredRoll , -20*Math.PI/180, 20*Math.PI/180);
    demo.pidTarget.alt   = this.altitude;

    demo.updatePIDControl(performance.now());
  }
}


