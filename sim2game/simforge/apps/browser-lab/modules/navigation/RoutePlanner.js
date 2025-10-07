import * as THREE from 'three';
import RBush from 'rbush';
import PF from 'pathfinding';

export class RoutePlanner {
  constructor(parent) {
    this.parent = parent;
    this.scene = parent.scene;
    this.obstacleIndex = new RBush();
    this.bounds = new THREE.Box3();
    this.cellSize = 0.25; // meters
    this.group = new THREE.Group();
    this.group.name = 'PlannedPath';
    this.scene.add(this.group);
    this.line = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineDashedMaterial({ color: 0xef5350, dashSize: 0.12, gapSize: 0.08 })
    );
    this.line.computeLineDistances();
    this.group.add(this.line);
  }

  clearVisualization() {
    this.line.geometry.dispose();
    this.line.geometry = new THREE.BufferGeometry();
  }

  rebuildObstacleIndex() {
    const items = [];
    const box = new THREE.Box3();
    const mat4 = new THREE.Matrix4();
    this.bounds.makeEmpty();

    this.scene.traverse((obj) => {
      if (!obj.visible) return;
      const mesh = obj;
      if (!mesh.geometry) return;
      if (mesh.name === 'MuJoCo Root') return; // skip root grouping
      if (mesh.isLight) return;
      try {
        box.setFromObject(mesh);
        if (!box.isEmpty()) {
          // expand scene bounds
          this.bounds.union(box);
          // store obstacle projection to XZ plane
          const min = box.min; const max = box.max;
          items.push({
            minX: min.x, minY: min.z,
            maxX: max.x, maxY: max.z
          });
        }
      } catch (e) { /* ignore malformed */ }
    });

    this.obstacleIndex.clear();
    if (items.length > 0) this.obstacleIndex.load(items);
    return { count: items.length, bounds: this.bounds.clone() };
  }

  _computeGrid(bounds, cellSize) {
    const min = bounds.min; const max = bounds.max;
    const width = Math.max(1, Math.ceil((max.x - min.x) / cellSize));
    const height = Math.max(1, Math.ceil((max.z - min.z) / cellSize));
    const grid = new PF.Grid(width, height);

    const worldToGrid = (x, z) => {
      const gx = Math.max(0, Math.min(width - 1, Math.floor((x - min.x) / cellSize)));
      const gz = Math.max(0, Math.min(height - 1, Math.floor((z - min.z) / cellSize)));
      return { gx, gz };
    };
    const gridToWorld = (gx, gz, y = 0) => {
      const x = min.x + (gx + 0.5) * cellSize;
      const z = min.z + (gz + 0.5) * cellSize;
      return new THREE.Vector3(x, y, z);
    };

    // mark blocked by sampling cell centers against rbush rectangles
    for (let gz = 0; gz < height; gz++) {
      for (let gx = 0; gx < width; gx++) {
        const p = gridToWorld(gx, gz, 0);
        const hit = this.obstacleIndex.search({ minX: p.x, minY: p.z, maxX: p.x, maxY: p.z });
        if (hit && hit.length > 0) {
          grid.setWalkableAt(gx, gz, false);
        }
      }
    }

    return { grid, worldToGrid, gridToWorld, width, height };
  }

  planSegment(start, goal, yStart, yGoal) {
    const cell = this.cellSize;
    if (this.bounds.isEmpty()) this.rebuildObstacleIndex();
    const { grid, worldToGrid, gridToWorld } = this._computeGrid(this.bounds, cell);

    const s = worldToGrid(start.x, start.z);
    const g = worldToGrid(goal.x, goal.z);
    const finder = new PF.AStarFinder({ allowDiagonal: false, dontCrossCorners: true, heuristic: PF.Heuristic.manhattan });
    const path = finder.findPath(s.gx, s.gz, g.gx, g.gz, grid);
    if (!path || path.length === 0) return [];
    const pts = [];
    for (let i = 0; i < path.length; i++) {
      const [gx, gz] = path[i];
      const alpha = i / Math.max(1, path.length - 1);
      const y = yStart + (yGoal - yStart) * alpha;
      pts.push(gridToWorld(gx, gz, y));
    }
    return pts;
  }

  planBetweenWaypoints(points) {
    if (!points || points.length < 2) return [];
    this.clearVisualization();
    this.rebuildObstacleIndex();
    const result = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const seg = this.planSegment(a, b, a.y, b.y);
      if (i > 0 && result.length > 0 && seg.length > 0) seg.shift(); // avoid duplicate seam
      result.push(...seg);
    }

    // visualize
    if (result.length > 1) {
      const pos = new Float32Array(result.length * 3);
      for (let i = 0; i < result.length; i++) {
        const v = result[i];
        pos[i*3+0] = v.x; pos[i*3+1] = v.y; pos[i*3+2] = v.z;
      }
      this.line.geometry.dispose();
      this.line.geometry = new THREE.BufferGeometry();
      this.line.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      this.line.computeLineDistances();
    }
    return result;
  }
}


