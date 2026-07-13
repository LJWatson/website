#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const projectRoot = path.resolve(__dirname, "..");
const featurePacksRoot = path.join(projectRoot, "feature-packs");
const packagePath = path.join(projectRoot, "package.json");
const featuresPath = path.join(projectRoot, "features.json");
const cmsConfigPath = path.join(projectRoot, "src", "admin", "config.yml");
const navigationPath = path.join(projectRoot, "src", "_data", "navigation.json");
const footerNavigationPath = path.join(projectRoot, "src", "_data", "footer_navigation.json");

const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const features = JSON.parse(fs.readFileSync(featuresPath, "utf8"));
const cmsConfig = yaml.load(fs.readFileSync(cmsConfigPath, "utf8"));
const navigation = JSON.parse(fs.readFileSync(navigationPath, "utf8"));
const footerNavigation = JSON.parse(fs.readFileSync(footerNavigationPath, "utf8"));
const findings = [];

function addFinding(message) {
  findings.push(message);
}

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

function hasInstalledPackFiles(filesRoot) {
  const packFiles = collectPackFiles(filesRoot);

  return packFiles.some((sourcePath) => {
    const destinationPath = sourcePath.replace(`${filesRoot}${path.sep}`, `${projectRoot}${path.sep}`);

    return fs.existsSync(destinationPath);
  });
}

function getFeaturePackNames() {
  return fs.readdirSync(featurePacksRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

for (const featureName of getFeaturePackNames()) {
  const featureDir = path.join(featurePacksRoot, featureName);
  const manifestPath = path.join(featureDir, "manifest.json");
  const pluginPath = path.join(featureDir, "plugin.js");
  const filesRoot = path.join(featureDir, "files");
  const cmsConfigPatchPath = path.join(featureDir, "cms-config.yml");

  if (!fs.existsSync(manifestPath)) {
    addFinding(`${featureName}: missing manifest.json`);
    continue;
  }

  if (!fs.existsSync(pluginPath)) {
    addFinding(`${featureName}: missing plugin.js`);
  }

  if (!fs.existsSync(filesRoot)) {
    addFinding(`${featureName}: missing files/`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const addScriptName = `add:${featureName}`;
  const removeScriptName = `remove:${featureName}`;

  if (!(manifest.featureFlag in features)) {
    addFinding(`${featureName}: feature flag "${manifest.featureFlag}" is missing from features.json`);
  }

  if (pkg.scripts[addScriptName] !== `node scripts/add-feature.js ${featureName}`) {
    addFinding(`${featureName}: package.json is missing or misconfiguring ${addScriptName}`);
  }

  if (pkg.scripts[removeScriptName] !== `node scripts/remove-feature.js ${featureName}`) {
    addFinding(`${featureName}: package.json is missing or misconfiguring ${removeScriptName}`);
  }

  if (manifest.cms && !fs.existsSync(cmsConfigPatchPath)) {
    addFinding(`${featureName}: manifest.cms is true but cms-config.yml is missing`);
  }

  const mainUrls = new Set((manifest.mainNavigationItems || []).map((item) => item.url));
  const footerUrls = new Set((manifest.footerNavigationItems || []).map((item) => item.url));
  const hasMainNavUrl = navigation.items.some((item) => mainUrls.has(item.url));
  const hasFooterNavUrl = footerNavigation.items.some((item) => footerUrls.has(item.url));
  const pagesCollection = cmsConfig.collections.find((collection) => collection.name === "pages");
  const installedPageFiles = new Set((pagesCollection?.files || []).map((file) => file.file));
  const installedCollections = new Set(cmsConfig.collections.map((collection) => collection.name));

  let patchConfig = null;

  if (fs.existsSync(cmsConfigPatchPath)) {
    patchConfig = yaml.load(fs.readFileSync(cmsConfigPatchPath, "utf8"));
  }

  const hasCmsPages = Boolean(
    patchConfig?.pagesFiles?.some((pageFile) => installedPageFiles.has(pageFile.file))
  );
  const hasCmsCollections = Boolean(
    patchConfig?.collections?.some((collection) => installedCollections.has(collection.name))
  );
  const isEnabled = Boolean(features[manifest.featureFlag]);
  const isInstalled = fs.existsSync(filesRoot) && hasInstalledPackFiles(filesRoot);

  if (isEnabled && !isInstalled) {
    addFinding(`${featureName}: feature flag is enabled but pack files are not installed in src/`);
  }

  if (!isEnabled && isInstalled) {
    addFinding(`${featureName}: feature flag is disabled but pack files are still installed in src/`);
  }

  if (isEnabled && mainUrls.size > 0 && !hasMainNavUrl) {
    addFinding(`${featureName}: feature is enabled but main navigation items are missing`);
  }

  if (!isEnabled && hasMainNavUrl) {
    addFinding(`${featureName}: feature is disabled but main navigation still includes its URL`);
  }

  if (isEnabled && footerUrls.size > 0 && !hasFooterNavUrl) {
    addFinding(`${featureName}: feature is enabled but footer navigation items are missing`);
  }

  if (!isEnabled && hasFooterNavUrl) {
    addFinding(`${featureName}: feature is disabled but footer navigation still includes its URL`);
  }

  if (manifest.cms && isEnabled && !(hasCmsPages || hasCmsCollections)) {
    addFinding(`${featureName}: feature is enabled but CMS entries are missing`);
  }

  if (manifest.cms && !isEnabled && (hasCmsPages || hasCmsCollections)) {
    addFinding(`${featureName}: feature is disabled but CMS entries are still present`);
  }
}

const manifestFlags = new Set(
  getFeaturePackNames().map((featureName) => {
    const manifestPath = path.join(featurePacksRoot, featureName, "manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

    return manifest.featureFlag;
  })
);

for (const featureFlag of Object.keys(features)) {
  if (!manifestFlags.has(featureFlag)) {
    addFinding(`features.json contains "${featureFlag}" but no feature pack manifest declares it`);
  }
}

if (findings.length > 0) {
  console.log("Boilerplate check failed:");
  for (const finding of findings) {
    console.log(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Boilerplate check passed");
