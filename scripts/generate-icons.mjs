import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'logo.svg');

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svgPath)
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, `logo-${size}.png`));
  console.log(`Generated logo-${size}.png`);
}
