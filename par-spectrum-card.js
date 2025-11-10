/**
 * PAR Spectrum Card for Home Assistant
 * Displays spectral power distribution from AS7341 sensors
 * 
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 */

class PARSpectrumCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }

    this._config = {
      title: config.title || 'PAR Spectrum Distribution',
      height: config.height || 400,
      show_legend: config.show_legend !== false,
      show_values: config.show_values !== false,
      show_only_when_on: config.show_only_when_on || null,
      max_value: config.max_value || null,
      theme: config.theme || 'dark',
      entities: config.entities
    };

    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateChart();
  }

  getCardSize() {
    return 5;
  }

  render() {
    const isDark = this._config.theme === 'dark';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        ha-card {
          padding: 16px;
          background: ${isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .title {
          font-size: 18px;
          font-weight: 700;
          color: ${isDark ? '#9C27B0' : '#7B1FA2'};
        }
        
        .capture-button {
          background: linear-gradient(135deg, #9C27B0, #7B1FA2);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(156, 39, 176, 0.3);
          transition: all 0.3s ease;
        }
        
        .capture-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(156, 39, 176, 0.4);
        }
        
        .capture-button:active {
          transform: translateY(0);
        }
        
        .capture-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .spectrum-container {
          position: relative;
          width: 100%;
          height: ${this._config.height}px;
        }
        
        .spectrum-canvas {
          width: 100%;
          height: 100%;
        }
        
        .legend {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 16px;
          font-size: 11px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 3px;
        }
        
        .legend-label {
          color: ${isDark ? '#E0E0E0' : '#424242'};
          font-weight: 600;
        }
        
        .legend-value {
          color: ${isDark ? '#9E9E9E' : '#757575'};
        }
        
        .no-data {
          text-align: center;
          padding: 40px;
          color: ${isDark ? '#9E9E9E' : '#757575'};
        }
        
        .axis-label {
          position: absolute;
          font-size: 12px;
          font-weight: 600;
          color: ${isDark ? '#9C27B0' : '#7B1FA2'};
        }
        
        .x-axis-label {
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .y-axis-label {
          top: 50%;
          left: 0;
          transform: translateY(-50%) rotate(-90deg);
          transform-origin: center;
        }
        
        .last-capture {
          text-align: center;
          font-size: 11px;
          color: ${isDark ? '#9E9E9E' : '#757575'};
          margin-top: 8px;
        }
      </style>
      
      <ha-card>
        <div class="card-header">
          <div class="title">${this._config.title}</div>
          <button class="capture-button" id="captureBtn">📸 Capture Spectrum</button>
        </div>
        <div class="spectrum-container">
          <canvas class="spectrum-canvas" id="spectrumCanvas"></canvas>
          <div class="axis-label x-axis-label">Wavelength (nanometers)</div>
          <div class="axis-label y-axis-label">Relative Intensity (%)</div>
        </div>
        <div class="last-capture" id="lastCapture"></div>
        ${this._config.show_legend ? '<div class="legend" id="legend"></div>' : ''}
      </ha-card>
    `;
    
    // Add button click handler
    const captureBtn = this.shadowRoot.getElementById('captureBtn');
    if (captureBtn) {
      captureBtn.addEventListener('click', () => this.captureSpectrum());
    }
  }

  captureSpectrum() {
    if (!this._hass || !this._config.entities) return;

    const captureBtn = this.shadowRoot.getElementById('captureBtn');
    if (captureBtn) {
      captureBtn.disabled = true;
      captureBtn.textContent = '📸 Capturing...';
    }

    // Get sensor values
    const wavelengths = [
      { nm: 415, key: 'violet_415nm', color: '#9C27B0', name: 'Violet' },
      { nm: 445, key: 'indigo_445nm', color: '#3F51B5', name: 'Indigo' },
      { nm: 480, key: 'blue_480nm', color: '#2196F3', name: 'Blue' },
      { nm: 515, key: 'cyan_515nm', color: '#00BCD4', name: 'Cyan' },
      { nm: 555, key: 'green_555nm', color: '#4CAF50', name: 'Green' },
      { nm: 590, key: 'yellow_590nm', color: '#FFEB3B', name: 'Yellow' },
      { nm: 630, key: 'orange_630nm', color: '#FF9800', name: 'Orange' },
      { nm: 680, key: 'red_680nm', color: '#F44336', name: 'Red' }
    ];

    const data = wavelengths.map(w => {
      const entityId = this._config.entities[w.key];
      if (!entityId) return { ...w, value: 0 };
      
      const entity = this._hass.states[entityId];
      const value = entity ? parseFloat(entity.state) || 0 : 0;
      return { ...w, value };
    });

    // Store captured data
    this._capturedData = data;
    this._captureTime = new Date();

    // Draw the spectrum chart
    this.drawSpectrum(data);

    // Update legend
    if (this._config.show_legend) {
      this.updateLegend(data);
    }

    // Update last capture time
    const lastCaptureEl = this.shadowRoot.getElementById('lastCapture');
    if (lastCaptureEl) {
      lastCaptureEl.textContent = `Last captured: ${this._captureTime.toLocaleTimeString()}`;
    }

    // Re-enable button
    setTimeout(() => {
      if (captureBtn) {
        captureBtn.disabled = false;
        captureBtn.textContent = '📸 Capture Spectrum';
      }
    }, 1000);
  }

  updateChart() {
    // Only update if we have captured data
    if (this._capturedData) {
      this.drawSpectrum(this._capturedData);
      if (this._config.show_legend) {
        this.updateLegend(this._capturedData);
      }
    }
  }

  drawSpectrum(data) {
    const canvas = this.shadowRoot.getElementById('spectrumCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value
    const maxValue = this._config.max_value || Math.max(...data.map(d => d.value)) * 1.1;

    // Draw grid
    this.drawGrid(ctx, padding, chartWidth, chartHeight, maxValue);

    // Draw single spectrum curve (McCree style)
    this.drawWavelengthCurve(ctx, data, padding, chartWidth, chartHeight, maxValue);

    // Draw axes
    this.drawAxes(ctx, data, padding, chartWidth, chartHeight, maxValue);
  }

  drawGrid(ctx, padding, chartWidth, chartHeight, maxValue) {
    ctx.strokeStyle = this._config.theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 8; i++) {
      const x = padding.left + (chartWidth / 8) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }
  }

  drawWavelengthCurve(ctx, data, padding, chartWidth, chartHeight, maxValue) {
    // Create smooth curve through all data points
    const points = [];
    
    // Generate points for smooth curve
    for (let i = 0; i < data.length; i++) {
      const x = padding.left + (chartWidth / (data.length - 1)) * i;
      const normalizedValue = data[i].value / maxValue;
      const y = padding.top + chartHeight - (normalizedValue * chartHeight);
      points.push({ x, y, color: data[i].color });
    }

    // Create horizontal gradient matching spectrum colors
    const gradient = ctx.createLinearGradient(padding.left, 0, padding.left + chartWidth, 0);
    gradient.addColorStop(0, 'rgba(156, 39, 176, 0.8)');    // Violet
    gradient.addColorStop(0.14, 'rgba(63, 81, 181, 0.8)');  // Indigo
    gradient.addColorStop(0.28, 'rgba(33, 150, 243, 0.8)'); // Blue
    gradient.addColorStop(0.42, 'rgba(0, 188, 212, 0.8)');  // Cyan
    gradient.addColorStop(0.56, 'rgba(76, 175, 80, 0.8)');  // Green
    gradient.addColorStop(0.70, 'rgba(255, 235, 59, 0.8)'); // Yellow
    gradient.addColorStop(0.84, 'rgba(255, 152, 0, 0.8)');  // Orange
    gradient.addColorStop(1, 'rgba(244, 67, 54, 0.8)');     // Red

    // Draw filled area with gradient
    ctx.beginPath();
    ctx.moveTo(points[0].x, padding.top + chartHeight);
    
    // Draw smooth curve using quadratic curves
    ctx.lineTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      const yMid = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xMid, yMid);
    }
    
    // Last point
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(lastPoint.x, padding.top + chartHeight);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw outline
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i].x + points[i + 1].x) / 2;
      const yMid = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xMid, yMid);
    }
    
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  generateCurvePoints(wavelength, allData, padding, chartWidth, chartHeight, maxValue) {
    const points = [];
    const index = allData.findIndex(d => d.nm === wavelength.nm);
    const totalWavelengths = allData.length;
    
    // Generate bell curve around the wavelength position
    const centerX = padding.left + (chartWidth / (totalWavelengths - 1)) * index;
    const peakValue = wavelength.value;
    const spread = chartWidth / (totalWavelengths * 2); // Width of the bell curve

    // Generate points for smooth curve
    for (let i = -spread; i <= spread; i += 5) {
      const x = centerX + i;
      if (x < padding.left || x > padding.left + chartWidth) continue;

      // Gaussian bell curve formula
      const normalizedDist = i / spread;
      const intensity = peakValue * Math.exp(-4 * normalizedDist * normalizedDist);
      const y = padding.top + chartHeight - (intensity / maxValue) * chartHeight;

      points.push({ x, y });
    }

    return points;
  }

  drawAxes(ctx, data, padding, chartWidth, chartHeight, maxValue) {
    const isDark = this._config.theme === 'dark';
    ctx.fillStyle = isDark ? '#E0E0E0' : '#424242';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (wavelengths)
    data.forEach((wavelength, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight + 20;
      
      ctx.fillStyle = wavelength.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${wavelength.nm}nm`, x, y);
      
      ctx.fillStyle = isDark ? '#9E9E9E' : '#757575';
      ctx.font = '9px sans-serif';
      ctx.fillText(wavelength.name, x, y + 14);
    });

    // Y-axis labels (intensity)
    ctx.textAlign = 'right';
    ctx.fillStyle = isDark ? '#9E9E9E' : '#757575';
    ctx.font = '10px sans-serif';
    
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i);
      const y = padding.top + (chartHeight / 5) * i;
      const label = value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toFixed(0);
      ctx.fillText(label, padding.left - 10, y + 4);
    }
  }

  updateLegend(data) {
    const legend = this.shadowRoot.getElementById('legend');
    if (!legend) return;

    legend.innerHTML = data.map(w => `
      <div class="legend-item">
        <div class="legend-color" style="background: ${w.color};"></div>
        <span class="legend-label">${w.nm}nm ${w.name}</span>
        ${this._config.show_values ? `<span class="legend-value">(${w.value.toFixed(0)})</span>` : ''}
      </div>
    `).join('');
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}

customElements.define('par-spectrum-card', PARSpectrumCard);

// Register the card with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'par-spectrum-card',
  name: 'PAR Spectrum Card',
  description: 'Display PAR spectrum data from AS7341 sensors',
  preview: true,
  documentationURL: 'https://github.com/goatboynz/par-spectrum-card'
});

console.info(
  '%c PAR-SPECTRUM-CARD %c 1.0.0 ',
  'color: white; background: #9C27B0; font-weight: 700;',
  'color: #9C27B0; background: white; font-weight: 700;'
);
