#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const imagesDir = path.resolve(__dirname, "..", "src", "images");
const sourceSvg = fs.readFileSync(path.join(imagesDir, "icon.svg"), "utf8");

// Maskable variant: full-bleed background (the OS applies its own mask/rounding)
// and the glyph shrunk to fit inside the ~80% safe-zone circle.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#1A1025"/>
<text x="50%" y="50%" dy="0.03em" text-anchor="middle" dominant-baseline="central" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-weight="700" font-size="220" fill="#F5F3FF">t</text>
</svg>`;

const targets = [
  { name: "icon-512.png", size: 512, svg: sourceSvg },
  { name: "icon-192.png", size: 192, svg: sourceSvg },
  { name: "apple-touch-icon.png", size: 180, svg: sourceSvg },
  { name: "favicon-32x32.png", size: 32, svg: sourceSvg },
  { name: "favicon-16x16.png", size: 16, svg: sourceSvg },
  { name: "icon-maskable.png", size: 512, svg: maskableSvg }
];

async function run() {
  for (const target of targets) {
    const outputPath = path.join(imagesDir, target.name);
    await sharp(Buffer.from(target.svg))
      .resize(target.size, target.size)
      .png()
      .toFile(outputPath);
    console.log(`Wrote ${target.name} (${target.size}x${target.size})`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
