#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const projectRoot = path.resolve(__dirname, "..");
const featureName = process.argv[2];
const isDryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

if (!featureName) {
  console.error("Usage: node scripts/remove-feature.js <feature> [--dry-run] [--force]");
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
const removedFiles = [];
const skippedModifiedFiles = [];
const removedDirs = [];
const removedMainNavigationItems = [];
const removedFooterNavigationItems = [];
const cmsChanges = [];

function collectPackFiles(sourceDir, collected = []) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);

    if (entry.isDirectory()) {
      collectPackFiles(sourcePath, collected);
      continue;
    }

    collected.push(sourcePath);
  }

  return collected;
}

function removeFileIfAllowed(sourcePath) {
  const destinationPath = sourcePath.replace(`${filesRoot}${path.sep}`, `${projectRoot}${path.sep}`);

  if (!fs.existsSync(destinationPath)) {
    return;
  }

  const relativePath = path.relative(projectRoot, destinationPath);
  const sourceContent = fs.readFileSync(sourcePath, "utf8");
  const destinationContent = fs.readFileSync(destinationPath, "utf8");

  if (!force && sourceContent !== destinationContent) {
    skippedModifiedFiles.push(relativePath);
    return;
  }

  if (!isDryRun) {
    fs.unlinkSync(destinationPath);
  }

  removedFiles.push(relativePath);
}

function removeEmptyDirectories() {
  const packDirectories = new Set(
    collectPackFiles(filesRoot).map((filePath) =>
      path.dirname(filePath.replace(`${filesRoot}${path.sep}`, `${projectRoot}${path.sep}`))
    )
  );

  const sortedDirectories = Array.from(packDirectories).sort((a, b) => b.length - a.length);

  for (const dirPath of sortedDirectories) {
    if (!fs.existsSync(dirPath) || dirPath === projectRoot) {
      continue;
    }

    const entries = fs.readdirSync(dirPath);
    if (entries.length > 0) {
      continue;
    }

    if (!isDryRun) {
      fs.rmdirSync(dirPath);
    }

    removedDirs.push(path.relative(projectRoot, dirPath) || ".");
  }
}

function removeNavigationItems(filePath, items, tracker) {
  if (!items || items.length === 0 || !fs.existsSync(filePath)) {
    return;
  }

  const navigation = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const urlsToRemove = new Set(items.map((item) => item.url));
  const originalCount = navigation.items.length;

  navigation.items = navigation.items.filter((item) => !urlsToRemove.has(item.url));

  if (navigation.items.length !== originalCount) {
    for (const item of items) {
      tracker.push(item.url);
    }

    if (!isDryRun) {
      fs.writeFileSync(filePath, `${JSON.stringify(navigation, null, 2)}\n`);
    }
  }
}

function removeCmsConfig() {
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

    if (pagesCollection && pagesCollection.files) {
      const filesToRemove = new Set(patchConfig.pagesFiles.map((pageFile) => pageFile.file));
      const originalCount = pagesCollection.files.length;

      pagesCollection.files = pagesCollection.files.filter((pageFile) => !filesToRemove.has(pageFile.file));

      if (pagesCollection.files.length !== originalCount) {
        for (const pageFile of patchConfig.pagesFiles) {
          cmsChanges.push(`page:${pageFile.file}`);
        }
      }
    }
  }

  if (patchConfig.collections && patchConfig.collections.length > 0) {
    const collectionsToRemove = new Set(patchConfig.collections.map((collection) => collection.name));
    const originalCount = currentConfig.collections.length;

    currentConfig.collections = currentConfig.collections.filter((collection) => !collectionsToRemove.has(collection.name));

    if (currentConfig.collections.length !== originalCount) {
      for (const collection of patchConfig.collections) {
        cmsChanges.push(`collection:${collection.name}`);
      }
    }
  }

  if (cmsChanges.length > 0 && !isDryRun) {
    fs.writeFileSync(cmsConfigPath, yaml.dump(currentConfig, { lineWidth: 120, noRefs: true }));
  }
}

for (const sourcePath of collectPackFiles(filesRoot)) {
  removeFileIfAllowed(sourcePath);
}

removeEmptyDirectories();

let disabledFeature = false;

if (features[manifest.featureFlag]) {
  features[manifest.featureFlag] = false;
  disabledFeature = true;

  if (!isDryRun) {
    fs.writeFileSync(featuresPath, `${JSON.stringify(features, null, 2)}\n`);
  }
}

removeNavigationItems(navigationPath, manifest.mainNavigationItems || [], removedMainNavigationItems);
removeNavigationItems(footerNavigationPath, manifest.footerNavigationItems || [], removedFooterNavigationItems);
removeCmsConfig();

console.log(`${isDryRun ? "Dry run:" : "Removed feature:"} ${featureName}`);

if (removedFiles.length > 0) {
  console.log("Removed files:");
  for (const file of removedFiles) {
    console.log(`  - ${file}`);
  }
}

if (skippedModifiedFiles.length > 0) {
  console.log("Skipped modified files (use --force to remove):");
  for (const file of skippedModifiedFiles) {
    console.log(`  - ${file}`);
  }
}

if (removedDirs.length > 0) {
  console.log("Removed empty directories:");
  for (const dir of removedDirs) {
    console.log(`  - ${dir}`);
  }
}

if (disabledFeature) {
  console.log(`Disabled feature flag: ${manifest.featureFlag}`);
}

if (removedMainNavigationItems.length > 0) {
  console.log("Removed main navigation items:");
  for (const item of removedMainNavigationItems) {
    console.log(`  - ${item}`);
  }
}

if (removedFooterNavigationItems.length > 0) {
  console.log("Removed footer navigation items:");
  for (const item of removedFooterNavigationItems) {
    console.log(`  - ${item}`);
  }
}

if (cmsChanges.length > 0) {
  console.log("Removed CMS config:");
  for (const change of cmsChanges) {
    console.log(`  - ${change}`);
  }
}
