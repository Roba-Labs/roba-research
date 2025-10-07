import { SkydioPidController } from './skydioPid.js';
import { Go1StandController } from './go1Stand.js';
import { SineActuatorController } from './sine.js';
import { WaypointController } from './waypoint.js';
import { FollowTargetController } from './followTarget.js';

/**
 * Select an appropriate controller for the requested scene.
 * @param {string} sceneName
 * @param {import('../../src/appShell.js').MuJoCoDemo} demo
 */
export function createControllerForScene(sceneName, demo) {
  if (typeof sceneName !== 'string') {
    return null;
  }

  if (sceneName.includes('skydio_x2')) {
    return new SkydioPidController(demo);
  }

  if (sceneName.includes('unitree_go1')) {
    return new Go1StandController(demo);
  }

  // Default fallback: sinusoidal driver for any other scene with actuators
  if (demo?.model?.nu > 0 || demo?.simulation?.ctrl?.length > 0) {
    return new SineActuatorController(demo);
  }

  return null;
}

/**
 * Create a controller by explicit type string.
 * @param {('auto'|'skydio'|'go1'|'sine'|'waypoints'|'follow'|'none'|string)} type
 * @param {import('../../src/appShell.js').MuJoCoDemo} demo
 */
export function createControllerByType(type, demo) {
  const t = (type || '').toLowerCase();
  if (t === 'none') return null;
  if (t === 'skydio') return new SkydioPidController(demo);
  if (t === 'go1') return new Go1StandController(demo);
  if (t === 'sine') return new SineActuatorController(demo);
  if (t === 'waypoints') return new WaypointController(demo);
  if (t === 'follow') return new FollowTargetController(demo);
  if (t === 'auto') return createControllerForScene(demo?.params?.scene, demo);
  // Unknown => try auto
  return createControllerForScene(demo?.params?.scene, demo);
}

