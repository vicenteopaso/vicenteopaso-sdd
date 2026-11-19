#!/usr/bin/env node

/**
 * DeepL Translation Script
 *
 * This script translates English content to Spanish using the DeepL API.
 * It handles both:
 * - MDX/MD content files under /content/en/
 * - UI dictionary strings in /i18n/en/ui.json
 *
 * Translation is idempotent - only new or changed content is translated.
 * Existing translations are preserved to avoid unnecessary API calls.
 *
 * Usage:
 *   DEEPL_API_KEY=<your-key> node scripts/translate.mjs
 *
 * Environment Variables:
 *   DEEPL_API_KEY - Required. Your DeepL API authentication key.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import * as deepl from "deepl-node";

// Configuration
const ROOT = process.cwd();
const EN_CONTENT_DIR = path.join(ROOT, "content", "en");
const ES_CONTENT_DIR = path.join(ROOT, "content", "es");
const EN_UI = path.join(ROOT, "i18n", "en", "ui.json");
const ES_UI = path.join(ROOT, "i18n", "es", "ui.json");
const UI_METADATA = path.join(ROOT, "i18n", "es", ".ui-metadata.json");

// Rate limiting configuration
const RATE_LIMIT_DELAY_MS = 100;

// Validate environment
if (!process.env.DEEPL_API_KEY) {
  console.error("❌ Error: DEEPL_API_KEY environment variable is required");
  process.exit(1);
}

const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

/**
 * Generate SHA-256 hash of a string for change detection
 */
function hash(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

/**
 * Translate text using DeepL API
 * @param {string} text - Text to translate
 * @returns {Promise<string>} Translated text
 */
async function translateText(text) {
  try {
    const result = await translator.translateText(text, null, "es");
    return result.text;
  } catch (error) {
    console.error("DeepL API error:", error.message);
    throw error;
  }
}

/**
 * Translate UI dictionary from English to Spanish
 * Only translates new keys or keys with changed English values
 * Returns object with success status and any failed keys
 */
async function translateUiJson() {
  console.log("\n📝 Translating UI dictionary...");

  const result = { success: true, failed: [] };

  if (!fs.existsSync(EN_UI)) {
    console.log("⚠️  English UI dictionary not found, skipping");
    return result;
  }

  const enRaw = fs.readFileSync(EN_UI, "utf8");
  let enJson;
  try {
    enJson = JSON.parse(enRaw);
  } catch (error) {
    console.error("❌ Failed to parse English UI dictionary:", error.message);
    process.exit(1);
  }

  let esJson = {};
  if (fs.existsSync(ES_UI)) {
    const esRaw = fs.readFileSync(ES_UI, "utf8");
    if (esRaw.trim()) {
      try {
        esJson = JSON.parse(esRaw);
      } catch (error) {
        console.log(
          "⚠️  Failed to parse existing Spanish UI dictionary",
          error,
        );
        esJson = {};
      }
    }
  }

  // Load UI translation metadata (tracks source hashes)
  let metadata = {};
  if (fs.existsSync(UI_METADATA)) {
    try {
      metadata = JSON.parse(fs.readFileSync(UI_METADATA, "utf8"));
    } catch (error) {
      console.log("⚠️  Failed to parse UI metadata, starting fresh", error);
      metadata = {};
    }
  }

  // Clean up orphaned keys (keys that exist in Spanish but not in English)
  const enKeys = new Set(Object.keys(enJson));
  const orphanedKeys = Object.keys(esJson).filter((key) => !enKeys.has(key));
  if (orphanedKeys.length > 0) {
    console.log(`🧹 Removing ${orphanedKeys.length} orphaned UI keys`);
    orphanedKeys.forEach((key) => {
      delete esJson[key];
      delete metadata[key];
    });
  }

  let changed = orphanedKeys.length > 0;
  let translatedCount = 0;
  let metadataChanged = orphanedKeys.length > 0;

  for (const [key, value] of Object.entries(enJson)) {
    if (typeof value !== "string") {
      console.log(
        `⚠️  UI dictionary must be flat - nested objects are not supported. Please flatten key: ${key}`,
      );
      continue;
    }

    const enValueHash = hash(value);

    // Check if we need to translate: missing or English value changed
    if (esJson[key] === undefined || metadata[key] !== enValueHash) {
      const action =
        esJson[key] === undefined
          ? "Translating"
          : "Re-translating (source changed)";
      console.log(`  ${action}: ${key}`);
      try {
        const translated = await translateText(value);
        esJson[key] = translated;
        metadata[key] = enValueHash;
        translatedCount++;
        changed = true; // Only mark as changed after successful translation
        metadataChanged = true;
        // Small delay to respect API rate limits
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMIT_DELAY_MS),
        );
      } catch (error) {
        console.error(`  ❌ Failed to translate key "${key}":`, error.message);
        result.failed.push({ key, error: error.message });
        result.success = false;
        // Don't update metadata for failed translations
      }
    }
  }

  if (changed) {
    fs.mkdirSync(path.dirname(ES_UI), { recursive: true });
    fs.writeFileSync(ES_UI, JSON.stringify(esJson, null, 2) + "\n", "utf8");
    console.log(
      `✅ UI dictionary updated: ${translatedCount} strings translated${orphanedKeys.length > 0 ? `, ${orphanedKeys.length} keys removed` : ""}`,
    );
  } else {
    console.log("✅ UI dictionary up to date");
  }

  // Save updated metadata
  if (metadataChanged) {
    fs.writeFileSync(
      UI_METADATA,
      JSON.stringify(metadata, null, 2) + "\n",
      "utf8",
    );
  }

  return result;
}

/**
 * Translate markdown/MDX files from English to Spanish
 * Uses a metadata file to track source content hashes and avoid re-translation
 * Returns object with success status and any failed files
 */
async function translateMdxFiles() {
  console.log("\n📄 Translating content files...");

  const result = { success: true, failed: [] };

  if (!fs.existsSync(EN_CONTENT_DIR)) {
    console.log("⚠️  English content directory not found, skipping");
    return result;
  }

  fs.mkdirSync(ES_CONTENT_DIR, { recursive: true });

  // Load translation metadata (tracks source hashes)
  const metadataPath = path.join(ES_CONTENT_DIR, ".translation-metadata.json");
  let metadata = {};
  if (fs.existsSync(metadataPath)) {
    try {
      metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    } catch (error) {
      console.log(
        "⚠️  Failed to parse translation metadata, starting fresh",
        error,
      );
      metadata = {};
    }
  }

  const files = fs
    .readdirSync(EN_CONTENT_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

  if (files.length === 0) {
    console.log("⚠️  No content files found");
    return result;
  }

  // Clean up orphaned translation files (Spanish files without English source)
  const enFiles = new Set(files);
  const esFiles = fs
    .readdirSync(ES_CONTENT_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  const orphanedFiles = esFiles.filter((f) => !enFiles.has(f));

  if (orphanedFiles.length > 0) {
    console.log(
      `🧹 Removing ${orphanedFiles.length} orphaned translation files`,
    );
    orphanedFiles.forEach((file) => {
      const esPath = path.join(ES_CONTENT_DIR, file);
      fs.unlinkSync(esPath);
      delete metadata[file];
      console.log(`  🗑️  Removed ${file}`);
    });
  }

  let translatedCount = 0;
  let skippedCount = 0;
  let metadataChanged = orphanedFiles.length > 0;

  for (const file of files) {
    const enPath = path.join(EN_CONTENT_DIR, file);
    const esPath = path.join(ES_CONTENT_DIR, file);

    const enContent = fs.readFileSync(enPath, "utf8");
    const enHash = hash(enContent);

    // Check if we've already translated this version of the source
    if (metadata[file] === enHash && fs.existsSync(esPath)) {
      console.log(`  ⏭️  Skipping ${file} (up to date)`);
      skippedCount++;
      continue;
    }

    console.log(`  Translating ${file}...`);
    try {
      const translated = await translateText(enContent);
      fs.writeFileSync(esPath, translated, "utf8");
      metadata[file] = enHash;
      metadataChanged = true;
      translatedCount++;
      console.log(`  ✅ ${file} translated`);
      // Small delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS));
    } catch (error) {
      console.error(`  ❌ Failed to translate ${file}:`, error.message);
      result.failed.push({ file, error: error.message });
      result.success = false;
      // Don't update metadata for failed files
    }
  }

  // Save updated metadata (excluding failed files)
  if (metadataChanged) {
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(metadata, null, 2) + "\n",
      "utf8",
    );
  }

  console.log(
    `\n✅ Content translation complete: ${translatedCount} files translated, ${skippedCount} skipped${orphanedFiles.length > 0 ? `, ${orphanedFiles.length} orphaned files removed` : ""}`,
  );

  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log("🌐 DeepL Translation Script");
  console.log("============================");

  try {
    // Verify DeepL API key is valid
    const usage = await translator.getUsage();
    if (usage.character) {
      console.log(
        `\n✅ DeepL API connected (${usage.character.count.toLocaleString()} / ${usage.character.limit.toLocaleString()} characters used)`,
      );
    }

    const uiResult = await translateUiJson();
    const mdxResult = await translateMdxFiles();

    // Collect all failures
    const allFailures = [
      ...uiResult.failed.map((f) => ({
        type: "UI key",
        name: f.key,
        error: f.error,
      })),
      ...mdxResult.failed.map((f) => ({
        type: "File",
        name: f.file,
        error: f.error,
      })),
    ];

    // Print summary
    if (allFailures.length > 0) {
      console.log("\n⚠️  Translation Summary:");
      console.log(`   ${allFailures.length} translation(s) failed:`);
      allFailures.forEach(({ type, name, error }) => {
        console.log(`   - ${type}: ${name}`);
        console.log(`     Error: ${error}`);
      });
      console.error("\n❌ Translation completed with errors");
      process.exit(1);
    } else {
      console.log("\n🎉 Translation complete! All translations successful.");
    }
  } catch (error) {
    console.error("\n❌ Translation failed:", error.message);
    if (error.message.includes("401") || error.message.includes("403")) {
      console.error(
        "   Check that your DEEPL_API_KEY is valid and has sufficient quota",
      );
    }
    process.exit(1);
  }
}

// Run the script
main();
