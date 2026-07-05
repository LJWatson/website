#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const distPath = path.resolve(__dirname, "..", "dist");

if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log("Removed dist/");
} else {
  console.log("dist/ is already clean");
}
