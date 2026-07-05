#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const criticalCssPath = path.join(projectRoot, "src", "css", "critical.css");
const headPath = path.join(projectRoot, "src", "_includes", "partials", "head.html");
const findings = [];

function addFinding(message) {
  findings.push(message);
}

function walkFiles(rootDir, extensions, collected = []) {
  if (!fs.existsSync(rootDir)) {
    return collected;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      walkFiles(entryPath, extensions, collected);
      continue;
    }

    if (extensions.includes(path.extname(entry.name))) {
      collected.push(entryPath);
    }
  }

  return collected;
}

function getRelativePath(filePath) {
  return path.relative(projectRoot, filePath);
}

function getCssFiles() {
  return [
    ...walkFiles(path.join(projectRoot, "src", "css"), [".css"]),
    ...walkFiles(path.join(projectRoot, "feature-packs"), [".css"])
  ].sort();
}

function checkTransformShorthand() {
  for (const filePath of getCssFiles()) {
    const contents = fs.readFileSync(filePath, "utf8");
    const lines = contents.split("\n");

    lines.forEach((line, index) => {
      if (/^\s*transform\s*:/.test(line)) {
        addFinding(`${getRelativePath(filePath)}:${index + 1} uses transform shorthand`);
      }
    });
  }
}

function getDefinedLayouts() {
  const contents = fs.readFileSync(criticalCssPath, "utf8");
  const matches = contents.matchAll(/\[data-layout="([^"]+)"\]/g);

  return new Set(Array.from(matches, (match) => match[1]));
}

function checkLayoutUsage() {
  const definedLayouts = getDefinedLayouts();
  const templateFiles = [
    ...walkFiles(path.join(projectRoot, "src"), [".html", ".njk", ".md"]),
    ...walkFiles(path.join(projectRoot, "feature-packs"), [".html", ".njk", ".md"])
  ];

  for (const filePath of templateFiles) {
    const contents = fs.readFileSync(filePath, "utf8");
    const matches = contents.matchAll(/data-layout="([^"]+)"/g);

    for (const match of matches) {
      const layoutName = match[1];

      if (!definedLayouts.has(layoutName)) {
        addFinding(`${getRelativePath(filePath)} uses undefined data-layout "${layoutName}"`);
      }
    }
  }
}

function getPackCssFiles() {
  const cssFiles = {};
  const packDirs = fs.readdirSync(path.join(projectRoot, "feature-packs"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  for (const packDir of packDirs) {
    const cssDir = path.join(projectRoot, "feature-packs", packDir.name, "files", "src", "css");

    if (!fs.existsSync(cssDir)) {
      continue;
    }

    const files = walkFiles(cssDir, [".css"]);

    files.forEach((filePath) => {
      cssFiles[path.basename(filePath)] = getRelativePath(filePath);
    });
  }

  return cssFiles;
}

function checkHeadCssHooks() {
  const contents = fs.readFileSync(headPath, "utf8");
  const referencedCssFiles = Array.from(contents.matchAll(/\/css\/([^"']+\.css)/g), (match) => match[1]);
  const packCssFiles = getPackCssFiles();

  for (const cssFile of Object.keys(packCssFiles)) {
    if (!referencedCssFiles.includes(cssFile)) {
      addFinding(`${packCssFiles[cssFile]} is not loaded from src/_includes/partials/head.html`);
    }
  }

  for (const cssFile of referencedCssFiles) {
    if (cssFile === "critical.css") {
      continue;
    }

    if (!packCssFiles[cssFile]) {
      addFinding(`src/_includes/partials/head.html references /css/${cssFile} but no pack CSS file exists`);
    }
  }
}

checkTransformShorthand();
checkLayoutUsage();
checkHeadCssHooks();

if (findings.length > 0) {
  console.log("CSS check failed:");
  findings.forEach((finding) => console.log(`- ${finding}`));
  process.exit(1);
}

console.log("CSS check passed");
