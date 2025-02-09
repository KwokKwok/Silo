import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const inputFile = path.resolve('public/logo_bg.svg');
const outputDir = path.resolve('public');

async function generateIcons () {
  try {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `logo${size}.png`);
      await sharp(inputFile)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      console.log(`Generated ${size}x${size} icon: ${outputFile}`);
    }
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 