import * as THREE from 'three';

export class FollowTargetController {
  constructor(demo) {
    this.demo = demo;
    this.type = 'follow';
    this.offset = new THREE.Vector3(0, 0.5, 0.8); // desired offset from target
    this.maxPitch = 20 * Math.PI / 180;
    this.maxRoll  = 20 * Math.PI / 180;
  }

  onSceneActivated() {
    if (this.demo?.inputManager) {
      this.demo.inputManager.setEnabled(false);
      this.demo.inputManager.reset();
    }
    this.reset();
  }

  reset() {}

  dispose() {
    if (this.demo?.inputManager) {
      this.demo.inputManager.reset();
      this.demo.inputManager.setEnabled(false);
    }
  }

  update(dt) {
    const demo = this.demo;
    const selector = demo?.targetSelector;
    if (!demo || !demo.simulation || !selector || !selector.selected) return;

    const qpos = demo.simulation.qpos;
    if (!qpos || qpos.length < 7) return;

    // Drone world pos (three coords already used elsewhere)
    const dronePos = new THREE.Vector3(qpos[0], qpos[2], -qpos[1]);

    // Target world pos
    const targetWorld = new THREE.Vector3();
    selector.selected.getWorldPosition(targetWorld);
    const desired = targetWorld.clone().add(this.offset);
    const vector = desired.clone().sub(dronePos);

    // Simple pursuit mapping to pitch/roll
    const forward = vector.clone().normalize();
    const desiredPitch = -Math.atan2(forward.x, 1) * 0.3;
    const desiredRoll  =  Math.atan2(forward.z, 1) * 0.3;

    demo.params.pidEnabled = true;
    demo.pidTarget.pitch = THREE.MathUtils.clamp(desiredPitch, -this.maxPitch, this.maxPitch);
    demo.pidTarget.roll  = THREE.MathUtils.clamp(desiredRoll , -this.maxRoll , this.maxRoll);
    demo.pidTarget.alt   = desired.y;

    demo.updatePIDControl(performance.now());
  }
}


