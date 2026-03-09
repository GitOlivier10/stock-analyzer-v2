const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createIcons() {
  const svgPath = path.join(__dirname, 'assets', 'icon.svg');
  const pngPath = path.join(__dirname, 'assets', 'icon.png');
  const icoPath = path.join(__dirname, 'assets', 'icon.ico');

  try {
    // Convert SVG to PNG (256x256)
    await sharp(svgPath)
      .resize(256, 256)
      .png()
      .toFile(pngPath);

    console.log('✅ PNG icon created');

    // For ICO, we'll use the PNG as base
    // Note: For production, you might want to use a proper ICO converter
    // For now, electron-builder can handle PNG files for Windows

    console.log('✅ Icons ready for Electron build');
  } catch (error) {
    console.error('❌ Error creating icons:', error);
  }
}

createIcons();