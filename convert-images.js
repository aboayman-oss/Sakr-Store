#!/usr/bin/env node

/**
 * Image Conversion Script for Sakr Store
 * Converts JPG/PNG images to WebP and AVIF formats using Sharp
 * 
 * Usage: node convert-images.js
 * 
 * Requirements: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  imagesDir: './images',
  webpQuality: 80,
  avifQuality: 60,
  recursive: true,
  extensions: ['.jpg', '.jpeg', '.png']
};

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2);
}

function getAllImageFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && CONFIG.recursive) {
      getAllImageFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

async function convertImage(inputPath) {
  const parsedPath = path.parse(inputPath);
  const webpPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
  const avifPath = path.join(parsedPath.dir, `${parsedPath.name}.avif`);
  
  const stats = {
    webp: { converted: false, skipped: false, error: null },
    avif: { converted: false, skipped: false, error: null }
  };
  
  log(`Processing: ${path.basename(inputPath)}`, 'white');
  
  const originalSize = fs.statSync(inputPath).size;
  
  // Convert to WebP
  if (fs.existsSync(webpPath)) {
    log('  WebP: Skipped (already exists)', 'yellow');
    stats.webp.skipped = true;
  } else {
    try {
      await sharp(inputPath)
        .webp({ quality: CONFIG.webpQuality })
        .toFile(webpPath);
      
      const webpSize = fs.statSync(webpPath).size;
      const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
      log(`  WebP: Created (${formatBytes(originalSize)}KB → ${formatBytes(webpSize)}KB, saved ${savings}%)`, 'green');
      stats.webp.converted = true;
    } catch (error) {
      log(`  WebP: Failed - ${error.message}`, 'red');
      stats.webp.error = error.message;
    }
  }
  
  // Convert to AVIF
  if (fs.existsSync(avifPath)) {
    log('  AVIF: Skipped (already exists)', 'yellow');
    stats.avif.skipped = true;
  } else {
    try {
      await sharp(inputPath)
        .avif({ quality: CONFIG.avifQuality })
        .toFile(avifPath);
      
      const avifSize = fs.statSync(avifPath).size;
      const savings = ((originalSize - avifSize) / originalSize * 100).toFixed(1);
      log(`  AVIF: Created (${formatBytes(originalSize)}KB → ${formatBytes(avifSize)}KB, saved ${savings}%)`, 'green');
      stats.avif.converted = true;
    } catch (error) {
      log(`  AVIF: Failed - ${error.message}`, 'red');
      stats.avif.error = error.message;
    }
  }
  
  console.log('');
  return stats;
}

async function main() {
  log('==================================================', 'cyan');
  log('Sakr Store - Image Optimization Script', 'cyan');
  log('==================================================', 'cyan');
  console.log('');
  
  // Check if images directory exists
  if (!fs.existsSync(CONFIG.imagesDir)) {
    log(`ERROR: Images directory not found: ${CONFIG.imagesDir}`, 'red');
    process.exit(1);
  }
  
  // Get all image files
  const imageFiles = getAllImageFiles(CONFIG.imagesDir);
  
  if (imageFiles.length === 0) {
    log(`No JPG or PNG images found in ${CONFIG.imagesDir}`, 'yellow');
    process.exit(0);
  }
  
  log(`Found ${imageFiles.length} images to convert`, 'green');
  console.log('');
  
  // Counters
  let convertedWebP = 0;
  let convertedAvif = 0;
  let skippedWebP = 0;
  let skippedAvif = 0;
  let errorsWebP = 0;
  let errorsAvif = 0;
  
  // Convert all images
  for (const imagePath of imageFiles) {
    const stats = await convertImage(imagePath);
    
    if (stats.webp.converted) convertedWebP++;
    if (stats.webp.skipped) skippedWebP++;
    if (stats.webp.error) errorsWebP++;
    
    if (stats.avif.converted) convertedAvif++;
    if (stats.avif.skipped) skippedAvif++;
    if (stats.avif.error) errorsAvif++;
  }
  
  // Summary
  log('==================================================', 'cyan');
  log('Conversion Complete!', 'cyan');
  log('==================================================', 'cyan');
  log(`WebP: ${convertedWebP} converted, ${skippedWebP} skipped, ${errorsWebP} errors`, convertedWebP > 0 ? 'green' : 'yellow');
  log(`AVIF: ${convertedAvif} converted, ${skippedAvif} skipped, ${errorsAvif} errors`, convertedAvif > 0 ? 'green' : 'yellow');
  console.log('');
  log('Next Steps:', 'yellow');
  log('1. Review the converted images in your images folder', 'white');
  log('2. Update products.json to reference the new image files if needed', 'white');
  log('3. Test the website in different browsers', 'white');
  log('4. Check the IMAGE_OPTIMIZATION_GUIDE.md for more details', 'white');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { convertImage, getAllImageFiles };
