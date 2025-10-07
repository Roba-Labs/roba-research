import * as THREE from 'three';
import Bezier from 'bezier-js';

export class PathSmoother {
  constructor(parent) {
    this.parent = parent;
    this.scene = parent.scene;
    this.group = new THREE.Group();
    this.group.name = 'SmoothedPath';
    this.scene.add(this.group);
    this.samples = [];
    this.line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0x66bb6a, dashSize: 0.1, gapSize: 0.05 })
    );
    this.line.computeLineDistances();
    this.group.add(this.line);
  }

  clear() {
    this.samples = [];
    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry();
  }

  /**
   * Create a smooth composite Bezier curve through points, return dense samples.
   * @param {THREE.Vector3[]} points
   * @param {number} tension 0..1 blending
   * @param {number} density number of samples per segment
   */
  build(points, tension = 0.5, density = 20) {
    this.clear();
    if (!Array.isArray(points) || points.length < 2) return [];

    const P = points.map(p => ({ x: p.x, y: p.y, z: p.z }));

    // Project to 2D ground plane (x,z), smooth with bezier-js per segment
    const samples = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)];
      const p1 = P[i];
      const p2 = P[i + 1];
      const p3 = P[Math.min(P.length - 1, i + 2)];

      const t = tension;
      const c1x = p1.x + (p2.x - p0.x) * t / 6;
      const c1y = p1.z + (p2.z - p0.z) * t / 6;
      const c2x = p2.x - (p3.x - p1.x) * t / 6;
      const c2y = p2.z - (p3.z - p1.z) * t / 6;

      const curve = new Bezier(p1.x, p1.z, c1x, c1y, c2x, c2y, p2.x, p2.y === undefined ? p2.z : p2.y);
      const seg = curve.getLUT(density);
      for (let k = 0; k < seg.length; k++) {
        const s = seg[k];
        // interpolate altitude linearly between p1.y and p2.y
        const alpha = k / (seg.length - 1);
        const y = p1.y + (p2.y - p1.y) * alpha;
        samples.push(new THREE.Vector3(s.x, y, s.y));
      }
    }

    this.samples = samples;
    const pos = new Float32Array(samples.length * 3);
    for (let i = 0; i < samples.length; i++) {
      const v = samples[i];
      pos[i*3+0] = v.x; pos[i*3+1] = v.y; pos[i*3+2] = v.z;
    }
    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry();
    if (pos.length > 0) {
      this.line.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.line.computeLineDistances();
    }
    return this.samples;
  }
}


