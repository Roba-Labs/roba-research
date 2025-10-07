import ROSLIB from 'roslib';

export class RosBridge {
  constructor() {
    this.ros = null;
    this.topics = {};
    this.params = {
      url: 'ws://localhost:9090',
      publishTelemetry: false,
      subscribeTeleop: false,
      frameId: 'map'
    };
    this.telemetryTopic = null;
    this.teleopTopic = null;
    this.connected = false;
  }

  connect(url) {
    const wsUrl = url || this.params.url;
    this.ros = new ROSLIB.Ros({ url: wsUrl });
    this.ros.on('connection', () => { this.connected = true; console.log('[ROS] connected:', wsUrl); this._setupTopics(); });
    this.ros.on('error', (e) => { console.error('[ROS] error:', e); });
    this.ros.on('close', () => { this.connected = false; console.warn('[ROS] closed'); });
  }

  disconnect() {
    try { this.ros?.close(); } catch (e) {}
    this.connected = false;
  }

  _setupTopics() {
    if (!this.ros) return;
    this.telemetryTopic = new ROSLIB.Topic({ ros: this.ros, name: '/sim/telemetry', messageType: 'geometry_msgs/PoseStamped' });
    this.teleopTopic = new ROSLIB.Topic({ ros: this.ros, name: '/sim/teleop', messageType: 'geometry_msgs/Twist' });
    if (this.params.subscribeTeleop) {
      this.teleopTopic.subscribe((msg) => {
        // Map cmd_vel-like twist to setpoints: linear.z to altitude, linear.x to pitch, linear.y to roll, angular.z to yaw rate
        const sp = this.latestSetpoint || { alt: 0.8, roll: 0, pitch: 0, yawRateCmd: 0 };
        sp.alt = Number(msg?.linear?.z) || sp.alt;
        sp.pitch = Number(msg?.linear?.x) || sp.pitch;
        sp.roll = Number(msg?.linear?.y) || sp.roll;
        sp.yawRateCmd = Number(msg?.angular?.z) || sp.yawRateCmd;
        this.latestSetpoint = sp;
        if (typeof this.onTeleop === 'function') this.onTeleop(sp);
      });
    }
  }

  publishPoseStamped(pose, stampSec) {
    if (!this.connected || !this.telemetryTopic) return;
    const nowSec = stampSec || (Date.now() / 1000);
    const msg = new ROSLIB.Message({
      header: { stamp: { sec: Math.floor(nowSec), nsec: Math.floor((nowSec % 1) * 1e9) }, frame_id: this.params.frameId },
      pose: {
        position: { x: pose.x || 0, y: pose.y || 0, z: pose.z || 0 },
        orientation: { x: pose.qx || 0, y: pose.qy || 0, z: pose.qz || 0, w: pose.qw || 1 }
      }
    });
    try { this.telemetryTopic.publish(msg); } catch (e) { /* ignore */ }
  }
}


