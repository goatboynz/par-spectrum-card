# PAR Spectrum Card for Home Assistant

A custom Lovelace card for displaying PAR (Photosynthetically Active Radiation) spectrum data from AS7341 sensors in Home Assistant.

Perfect for cannabis cultivation, hydroponics, and grow light monitoring!

## Features

- 🌈 Beautiful spectral power distribution visualization
- 📊 Displays 8 wavelength channels (415nm - 680nm) + NIR
- 🎨 Color-coded to match actual visible spectrum
- 💡 Smooth gradient area curves (like professional grow light spectrum charts)
- 📱 Responsive design
- ⚙️ Highly configurable

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the 3 dots in the top right
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/goatboynz/par-spectrum-card`
6. Category: "Lovelace"
7. Click "Install"
8. Restart Home Assistant

### Manual Installation

1. Download `par-spectrum-card.js`
2. Copy to `config/www/par-spectrum-card.js`
3. Add to Lovelace resources:
   ```yaml
   url: /local/par-spectrum-card.js
   type: module
   ```

## Configuration

### Basic Example

```yaml
type: custom:par-spectrum-card
entities:
  violet_415nm: sensor.f2_stats_mid_spectrum_415nm_violet
  indigo_445nm: sensor.f2_stats_mid_spectrum_445nm_indigo
  blue_480nm: sensor.f2_stats_mid_spectrum_480nm_blue
  cyan_515nm: sensor.f2_stats_mid_spectrum_515nm_cyan
  green_555nm: sensor.f2_stats_mid_spectrum_555nm_green
  yellow_590nm: sensor.f2_stats_mid_spectrum_590nm_yellow
  orange_630nm: sensor.f2_stats_mid_spectrum_630nm_orange
  red_680nm: sensor.f2_stats_mid_spectrum_680nm_red
title: PAR Spectrum Distribution
```

### Full Configuration

```yaml
type: custom:par-spectrum-card
entities:
  violet_415nm: sensor.spectrum_415nm
  indigo_445nm: sensor.spectrum_445nm
  blue_480nm: sensor.spectrum_480nm
  cyan_515nm: sensor.spectrum_515nm
  green_555nm: sensor.spectrum_555nm
  yellow_590nm: sensor.spectrum_590nm
  orange_630nm: sensor.spectrum_630nm
  red_680nm: sensor.spectrum_680nm
  nir: sensor.spectrum_nir  # Optional
  clear: sensor.spectrum_clear  # Optional
title: PAR Spectrum Distribution
height: 400
show_legend: true
show_values: true
# Removed - now uses capture button instead
max_value: 70000  # Optional - auto-scales if not set
theme: dark  # dark or light
```

## Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | **Required** | `custom:par-spectrum-card` |
| `entities` | object | **Required** | Sensor entities for each wavelength |
| `title` | string | `PAR Spectrum Distribution` | Card title |
| `height` | number | `400` | Chart height in pixels |
| `show_legend` | boolean | `true` | Show wavelength legend |
| `show_values` | boolean | `true` | Show current values |
| `show_only_when_on` | string | `null` | Entity ID to check (only show when on) |
| `max_value` | number | `auto` | Maximum Y-axis value |
| `theme` | string | `dark` | Color theme (dark/light) |

## Entities Object

The `entities` object should contain sensor entity IDs for each wavelength:

- `violet_415nm` - 415nm Violet channel
- `indigo_445nm` - 445nm Indigo channel
- `blue_480nm` - 480nm Blue channel
- `cyan_515nm` - 515nm Cyan channel
- `green_555nm` - 555nm Green channel
- `yellow_590nm` - 590nm Yellow channel
- `orange_630nm` - 630nm Orange channel
- `red_680nm` - 680nm Red channel
- `nir` - Near Infrared (optional)
- `clear` - Clear/Full spectrum (optional)

## AS7341 Sensor Integration

This card is designed to work with the AS7341 11-channel spectral sensor. The AS7341 provides:

- 8 visible spectrum channels (415nm - 680nm)
- 1 NIR channel
- 1 clear channel
- 1 flicker detection channel

Perfect for monitoring grow lights and ensuring optimal PAR spectrum for plant growth!

## Screenshots

![PAR Spectrum Card](screenshot.png)

## Support

For issues, feature requests, or questions, please open an issue on GitHub.

## License

MIT License
