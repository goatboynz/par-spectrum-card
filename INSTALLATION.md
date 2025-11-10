# Installation Guide

## Method 1: HACS (Recommended)

1. **Open HACS** in your Home Assistant instance
2. Click on **"Frontend"**
3. Click the **3 dots** in the top right corner
4. Select **"Custom repositories"**
5. Add the repository URL: `https://github.com/goatboynz/par-spectrum-card`
6. Select category: **"Lovelace"**
7. Click **"Add"**
8. Find "PAR Spectrum Card" in the list
9. Click **"Install"**
10. **Restart Home Assistant**

## Method 2: Manual Installation

1. Download `par-spectrum-card.js` from the latest release
2. Copy the file to your Home Assistant `config/www/` directory
3. Add the resource to your Lovelace configuration:

### Via UI:
- Go to **Settings** → **Dashboards** → **Resources**
- Click **"Add Resource"**
- URL: `/local/par-spectrum-card.js`
- Resource type: **JavaScript Module**
- Click **"Create"**

### Via YAML:
Add to your `configuration.yaml`:

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /local/par-spectrum-card.js
      type: module
```

4. **Restart Home Assistant**

## Verify Installation

1. Edit any dashboard
2. Click **"Add Card"**
3. Search for **"PAR Spectrum Card"**
4. If you see it, installation was successful!

## Usage Example

Add this to your Lovelace dashboard:

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
height: 400
show_legend: true
show_values: true
```

## Troubleshooting

### Card not showing up
- Clear browser cache (Ctrl+F5)
- Check browser console for errors (F12)
- Verify the resource is loaded in Developer Tools → Info

### "Custom element doesn't exist"
- Make sure you restarted Home Assistant after installation
- Check that the file is in the correct location
- Verify the resource URL is correct

### No data showing
- Check that your sensor entities exist and have valid states
- Verify entity IDs are correct in your configuration
- Make sure sensors are providing numeric values

## Support

For issues or questions:
- GitHub Issues: https://github.com/goatboynz/par-spectrum-card/issues
- Home Assistant Community: https://community.home-assistant.io/
