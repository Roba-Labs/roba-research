import * as THREE from 'three';

export class TargetSelector {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.enabled = false;
    this.selected = null;
    this._prev = null;
    this._ray = new THREE.Raycaster();
    this._mouse = new THREE.Vector2();
    this._onClick = this._onClick.bind(this);
  }

  setEnabled(enabled) {
    const canvas = this.renderer?.domElement;
    if (!canvas) return;
    if (this.enabled === enabled) return;
    this.enabled = !!enabled;
    if (this.enabled) {
      canvas.addEventListener('click', this._onClick);
    } else {
      canvas.removeEventListener('click', this._onClick);
      this.clear();
    }
  }

  clear() {
    if (this._prev && this._prev.material && this._prev.material.emissive) {
      try { this._prev.material.emissive.setHex(0x000000); } catch (e) {}
    }
    this._prev = null;
    this.selected = null;
  }

  _onClick(evt) {
    if (!this.enabled) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this._mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    this._mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    this._ray.setFromCamera(this._mouse, this.camera);
    const hits = this._ray.intersectObjects(this.scene.children, true);
    if (hits && hits.length > 0) {
      const obj = hits[0].object;
      this._highlight(obj);
    }
  }

  _highlight(obj) {
    if (this._prev && this._prev.material && this._prev.material.emissive) {
      try { this._prev.material.emissive.setHex(0x000000); } catch (e) {}
    }
    this._prev = obj;
    this.selected = obj;
    if (obj && obj.material && obj.material.emissive) {
      try { obj.material.emissive.setHex(0x44aa88); } catch (e) {}
    }
  }
}


