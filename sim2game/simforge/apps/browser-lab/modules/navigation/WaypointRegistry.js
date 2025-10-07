import * as THREE from 'three';

export class WaypointManager {
  constructor(parent) {
    this.parent = parent;
    this.scene = parent.scene;
    this.camera = parent.camera;
    this.renderer = parent.renderer;
    this.enabled = true;
    this.points = [];
    this.dwellSeconds = 2.0; // default loiter time per waypoint
    this.loop = true;
    this.group = new THREE.Group();
    this.group.name = 'Waypoints';
    this.scene.add(this.group);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this._onClick = this._onClick.bind(this);
    this._plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0); // ground plane y=0

    this.line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x00e5ff })
    );
    this.line.frustumCulled = false;
    this.group.add(this.line);

    this.setInteractive(true);
  }

  setInteractive(v) {
    const canvas = this.renderer?.domElement;
    if (!canvas) return;
    if (v) {
      canvas.addEventListener('dblclick', this._onClick);
    } else {
      canvas.removeEventListener('dblclick', this._onClick);
    }
  }

  clear() {
    this.points = [];
    while (this.group.children.length > 1) {
      const m = this.group.children.pop();
      m.geometry?.dispose?.();
      m.material?.dispose?.();
    }
    this._updateLine();
  }

  add(point) {
    this.points.push(point.clone());
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xffca28 })
    );
    sphere.position.copy(point);
    this.group.add(sphere);
    this._updateLine();
  }

  toJSON() {
    return JSON.stringify({
      loop: this.loop,
      dwellSeconds: this.dwellSeconds,
      points: this.points.map(p => ({ x:p.x, y:p.y, z:p.z }))
    }, null, 2);
  }

  loadFromJSON(text) {
    try {
      const obj = JSON.parse(text);
      this.clear();
      if (obj && Array.isArray(obj.points)) {
        this.loop = !!obj.loop;
        this.dwellSeconds = Number(obj.dwellSeconds) || this.dwellSeconds;
        for (let i = 0; i < obj.points.length; i++) {
          const p = obj.points[i];
          this.add(new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0));
        }
      } else if (Array.isArray(obj)) {
        // backward compatibility: plain array
        for (let i = 0; i < obj.length; i++) {
          const p = obj[i];
          this.add(new THREE.Vector3(p.x || 0, p.y || 0, p.z || 0));
        }
      }
    } catch (e) { console.error('Invalid waypoint JSON', e); }
  }

  _onClick(evt) {
    if (!this.enabled) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.parent.camera);
    const hit = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this._plane, hit);
    if (Number.isFinite(hit.x) && Number.isFinite(hit.y) && Number.isFinite(hit.z)) {
      this.add(hit);
    }
  }

  _updateLine() {
    const positions = new Float32Array(this.points.length * 3);
    for (let i = 0; i < this.points.length; i++) {
      const p = this.points[i];
      positions[i*3+0] = p.x;
      positions[i*3+1] = p.y;
      positions[i*3+2] = p.z;
    }
    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry();
    if (positions.length > 0) {
      this.line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }
  }
}


