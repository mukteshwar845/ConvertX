import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  console.log('Generating PWA icons from', svgPath);

  // 1. Standard 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // 2. Standard 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // 3. Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. Favicon 48x48
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  // 5. Maskable 192x192 (safe zone padding: 80% content size, 10% outer border with brand background)
  const inner192 = await sharp(svgBuffer)
    .resize(154, 154)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 37, g: 99, b: 235, alpha: 1 }, // #2563eb
    },
  })
    .composite([{ input: inner192, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-192.png'));
  console.log('Created icon-maskable-192.png');

  // 6. Maskable 512x512 (safe zone padding: 80% content size, 10% outer border with brand background)
  const inner512 = await sharp(svgBuffer)
    .resize(410, 410)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 37, g: 99, b: 235, alpha: 1 }, // #2563eb
    },
  })
    .composite([{ input: inner512, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));
  console.log('Created icon-maskable-512.png');

  console.log('All PWA icons successfully generated!');
}

generateIcons().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
