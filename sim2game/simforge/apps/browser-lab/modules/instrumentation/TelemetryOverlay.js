export class TelemetryOverlay {
  constructor(container, options = {}) {
    this.visible = true;
    this.maxPoints = options.maxPoints || 600;
    this.data = { z: [], roll: [], pitch: [], ctrl0: [] };
    this.canvas = document.createElement('canvas');
    this.canvas.width = options.width || 340;
    this.canvas.height = options.height || 180;
    this.canvas.style.position = 'absolute';
    this.canvas.style.bottom = '10px';
    this.canvas.style.left = '10px';
    this.canvas.style.background = 'rgba(0,0,0,0.5)';
    this.canvas.style.border = '1px solid rgba(255,255,255,0.3)';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  setVisible(v) {
    this.visible = !!v;
    this.canvas.style.display = this.visible ? 'block' : 'none';
  }

  push(z, roll, pitch, ctrl0) {
    const d = this.data;
    d.z.push(z || 0);
    d.roll.push(roll || 0);
    d.pitch.push(pitch || 0);
    d.ctrl0.push(ctrl0 || 0);
    for (const key of Object.keys(d)) {
      if (d[key].length > this.maxPoints) d[key].shift();
    }
  }

  render() {
    if (!this.visible) return;
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    ctx.clearRect(0, 0, width, height);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 34) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const drawSeries = (arr, color, yscale, yoffset) => {
      if (!arr.length) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const n = arr.length;
      for (let i = 0; i < n; i++) {
        const x = (i / (this.maxPoints - 1)) * width;
        const y = height * 0.5 + yoffset - (arr[n - (n - i)] || 0) * yscale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    drawSeries(this.data.z,    '#00e5ff', 20,  0);
    drawSeries(this.data.roll, '#ffca28', 40,  0);
    drawSeries(this.data.pitch,'#66bb6a', 40,  0);
    drawSeries(this.data.ctrl0,'#ef5350', 10, 50);

    ctx.fillStyle = 'white';
    ctx.font = '12px monospace';
    ctx.fillText('z (m), roll/pitch (rad), ctrl0', 10, 16);
  }
}


