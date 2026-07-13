#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const projectRoot = path.resolve(__dirname, "..");
const featureName = process.argv[2];
const isDryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

if (!featureName) {
  console.error("Usage: node scripts/add-feature.js <feature> [--dry-run] [--force]");
  process.exit(1);
}

const featureDir = path.join(projectRoot, "feature-packs", featureName);
const manifestPath = path.join(featureDir, "manifest.json");
const filesRoot = path.join(featureDir, "files");
const featuresPath = path.join(projectRoot, "features.json");
const navigationPath = path.join(projectRoot, "src", "_data", "navigation.json");
const footerNavigationPath = path.join(projectRoot, "src", "_data", "footer_navigation.json");
const cmsConfigPath = path.join(projectRoot, "src", "admin", "config.yml");
const cmsConfigPatchPath = path.join(featureDir, "cms-config.yml");

if (!fs.existsSync(featureDir) || !fs.existsSync(manifestPath) || !fs.existsSync(filesRoot)) {
  console.error(`Feature pack "${featureName}" is missing required files.`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const features = JSON.parse(fs.readFileSync(featuresPath, "utf8"));
const copied = [];
const skipped = [];
const createdDirs = new Set();
let enabledFeature = false;
const addedMainNavigationItems = [];
const addedFooterNavigationItems = [];
const cmsChanges = [];

function ensureDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    return;
  }
  if (!isDryRun) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  createdDirs.add(path.relative(projectRoot, dirPath) || ".");
}

function addNavigationItems(filePath, items, tracker) {
  if (!items || items.length === 0 || !fs.existsSync(filePath)) {
    return;
  }

  const navigation = JSON.parse(fs.readFileSync(filePath, "utf8"));

  for (const item of items) {
    const exists = navigation.items.some((entry) => entry.url === item.url);
    if (!exists) {
      navigation.items.push(item);
      tracker.push(item.url);
    }
  }

  if (tracker.length > 0 && !isDryRun) {
    fs.writeFileSync(filePath, `${JSON.stringify(navigation, null, 2)}\n`);
  }
}

function mergeCmsConfig() {
  if (!manifest.cms || !fs.existsSync(cmsConfigPath) || !fs.existsSync(cmsConfigPatchPath)) {
    return;
  }

  const currentConfig = yaml.load(fs.readFileSync(cmsConfigPath, "utf8"));
  const patchConfig = yaml.load(fs.readFileSync(cmsConfigPatchPath, "utf8"));

  if (!currentConfig.collections) {
    currentConfig.collections = [];
  }

  if (patchConfig.pagesFiles && patchConfig.pagesFiles.length > 0) {
    const pagesCollection = currentConfig.collections.find((collection) => collection.name === "pages");
    if (pagesCollection) {
      if (!pagesCollection.files) {
        pagesCollection.files = [];
      }

      for (const pageFile of patchConfig.pagesFiles) {
        const exists = pagesCollection.files.some((file) => file.file === pageFile.file);
        if (!exists) {
          pagesCollection.files.push(pageFile);
          cmsChanges.push(`page:${pageFile.file}`);
        }
      }
    }
  }

  if (patchConfig.collections && patchConfig.collections.length > 0) {
    for (const collectionPatch of patchConfig.collections) {
      const exists = currentConfig.collections.some((collection) => collection.name === collectionPatch.name);
      if (!exists) {
        currentConfig.collections.push(collectionPatch);
        cmsChanges.push(`collection:${collectionPatch.name}`);
      }
    }
  }

  if (cmsChanges.length > 0 && !isDryRun) {
    fs.writeFileSync(cmsConfigPath, yaml.dump(currentConfig, { lineWidth: 120, noRefs: true }));
  }
}

function copyRecursive(sourceDir, destinationDir) {
  ensureDir(destinationDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(sourcePath, destinationPath);
      continue;
    }

    const relativePath = path.relative(projectRoot, destinationPath);
    if (fs.existsSync(destinationPath) && !force) {
      skipped.push(relativePath);
      continue;
    }

    if (!isDryRun) {
      fs.copyFileSync(sourcePath, destinationPath);
    }
    copied.push(relativePath);
  }
}

copyRecursive(filesRoot, projectRoot);

if (!features[manifest.featureFlag]) {
  features[manifest.featureFlag] = true;
  enabledFeature = true;
  if (!isDryRun) {
    fs.writeFileSync(featuresPath, `${JSON.stringify(features, null, 2)}\n`);
  }
}

addNavigationItems(navigationPath, manifest.mainNavigationItems || [], addedMainNavigationItems);
addNavigationItems(footerNavigationPath, manifest.footerNavigationItems || [], addedFooterNavigationItems);
mergeCmsConfig();

console.log(`${isDryRun ? "Dry run:" : "Added feature:"} ${featureName}`);

if (createdDirs.size > 0) {
  console.log("Created directories:");
  for (const dir of createdDirs) {
    console.log(`  - ${dir}`);
  }
}

if (copied.length > 0) {
  console.log("Copied files:");
  for (const file of copied) {
    console.log(`  - ${file}`);
  }
}

if (skipped.length > 0) {
  console.log("Skipped existing files (use --force to overwrite):");
  for (const file of skipped) {
    console.log(`  - ${file}`);
  }
}

if (enabledFeature) {
  console.log(`Enabled feature flag: ${manifest.featureFlag}`);
}

if (addedMainNavigationItems.length > 0) {
  console.log("Added main navigation items:");
  for (const item of addedMainNavigationItems) {
    console.log(`  - ${item}`);
  }
}

if (addedFooterNavigationItems.length > 0) {
  console.log("Added footer navigation items:");
  for (const item of addedFooterNavigationItems) {
    console.log(`  - ${item}`);
  }
}

if (cmsChanges.length > 0) {
  console.log("Merged CMS config:");
  for (const change of cmsChanges) {
    console.log(`  - ${change}`);
  }
}
