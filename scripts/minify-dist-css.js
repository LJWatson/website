#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { transform } = require("lightningcss");

const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

function getCssFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const cssFiles = [];
  const entries = fs.readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      cssFiles.push(...getCssFiles(entryPath));
      continue;
    }

    if (entry.isFile() && path.extname(entry.name) === ".css") {
      cssFiles.push(entryPath);
    }
  }

  return cssFiles;
}

function minifyFile(filePath) {
  const source = fs.readFileSync(filePath);
  const result = transform({
    filename: filePath,
    code: source,
    minify: true,
    sourceMap: false
  });

  fs.writeFileSync(filePath, result.code);
}

const cssFiles = getCssFiles(distDir);

for (const filePath of cssFiles) {
  minifyFile(filePath);
}

console.log(`Minified ${cssFiles.length} CSS file${cssFiles.length === 1 ? "" : "s"} in dist.`);
