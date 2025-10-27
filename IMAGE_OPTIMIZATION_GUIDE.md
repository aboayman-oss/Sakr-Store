# Image Optimization Guide

## Performance Optimizations Implemented

### 1. Lazy Loading
All images across the website now use `loading="lazy"` attribute, which delays loading of off-screen images until the user scrolls near them.

**Benefits:**
- Faster initial page load
- Reduced bandwidth usage
- Better Core Web Vitals scores

**Implementation:**
- Static images in HTML files (product detail page)
- Dynamically generated images in JavaScript (product cards, cart items, thumbnails, related products)

### 2. Modern Image Formats (WebP/AVIF)

The codebase now includes helper functions to support WebP and AVIF formats with automatic fallback to JPG/PNG for older browsers.

#### How It Works

The `generateResponsiveImage()` function in `js/app.js` creates a `<picture>` element with multiple sources:

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

Browsers will automatically choose the best format they support:
1. **AVIF** - Best compression, newest format (Safari 16+, Chrome 85+, Firefox 93+)
2. **WebP** - Great compression, wide support (All modern browsers)
3. **JPG/PNG** - Fallback for older browsers

#### Converting Images to WebP/AVIF

You need to convert your existing images to WebP and AVIF formats. Here are several methods:

##### Method 1: Using Online Tools
- **Squoosh** (https://squoosh.app/) - Free, browser-based, drag & drop
- **CloudConvert** (https://cloudconvert.com/) - Batch conversion

##### Method 2: Using Command Line Tools

**For WebP (using cwebp):**
```bash
# Install cwebp
# Windows: Download from https://developers.google.com/speed/webp/download
# Mac: brew install webp
# Linux: sudo apt-get install webp

# Convert single image
cwebp -q 80 input.jpg -o output.webp

# Batch convert all JPG images in a folder (Windows PowerShell)
Get-ChildItem .\images\*.jpg | ForEach-Object { cwebp -q 80 $_.FullName -o ($_.DirectoryName + "\" + $_.BaseName + ".webp") }

# Batch convert (Mac/Linux)
for file in images/*.jpg; do cwebp -q 80 "$file" -o "${file%.jpg}.webp"; done
```

**For AVIF (using avifenc):**
```bash
# Install avifenc
# Windows/Mac/Linux: Download from https://github.com/AOMediaCodec/libavif/releases

# Convert single image
avifenc -s 0 input.jpg output.avif

# Batch convert (Windows PowerShell)
Get-ChildItem .\images\*.jpg | ForEach-Object { avifenc -s 0 $_.FullName ($_.DirectoryName + "\" + $_.BaseName + ".avif") }

# Batch convert (Mac/Linux)
for file in images/*.jpg; do avifenc -s 0 "$file" "${file%.jpg}.avif"; done
```

##### Method 3: Using Node.js Script

Create a file called `convert-images.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = './images';

// Get all image files
const imageFiles = fs.readdirSync(imagesDir).filter(file => 
  /\.(jpg|jpeg|png)$/i.test(file)
);

imageFiles.forEach(async (file) => {
  const inputPath = path.join(imagesDir, file);
  const baseName = path.parse(file).name;
  
  // Convert to WebP
  await sharp(inputPath)
    .webp({ quality: 80 })
    .toFile(path.join(imagesDir, `${baseName}.webp`));
  
  // Convert to AVIF
  await sharp(inputPath)
    .avif({ quality: 60 })
    .toFile(path.join(imagesDir, `${baseName}.avif`));
  
  console.log(`Converted: ${file}`);
});
```

Then run:
```bash
npm install sharp
node convert-images.js
```

#### Image Naming Convention

For the fallback system to work, you need to maintain this file structure:
```
images/
  product1.jpg       (original)
  product1.webp      (WebP version)
  product1.avif      (AVIF version)
  product2.png       (original)
  product2.webp      (WebP version)
  product2.avif      (AVIF version)
```

The helper function automatically generates the correct paths based on the original image filename.

#### Using the Helper Functions

The code includes two helper functions:

1. **`generateResponsiveImage(src, alt, className, lazy)`**
   - Creates `<picture>` element with WebP/AVIF sources
   - Best for better browser support
   - Use in innerHTML assignments

2. **`generateSimpleImage(src, alt, className, lazy)`**
   - Creates simple `<img>` with lazy loading
   - Currently used in the implementation
   - Easier to maintain

**To enable WebP/AVIF support:**

Replace `generateSimpleImage()` calls with `generateResponsiveImage()` in `js/app.js`:

```javascript
// Current (simple lazy loading)
${generateSimpleImage(getPrimaryImage(p), p.name || 'Product image', '', true)}

// With WebP/AVIF support
${generateResponsiveImage(getPrimaryImage(p), p.name || 'Product image', '', true)}
```

### 3. Performance Recommendations

#### Image Optimization Checklist
- [ ] Convert all product images to WebP and AVIF
- [ ] Optimize image dimensions (don't use 4000x4000 for 300x300 display)
- [ ] Compress images (JPG: 80% quality, WebP: 80% quality, AVIF: 60% quality)
- [ ] Use appropriate dimensions for different use cases:
  - Product cards: 400x400px
  - Product detail main image: 800x800px
  - Thumbnails: 100x100px

#### Expected Performance Gains
- **File size reduction:** 30-50% with WebP, 50-70% with AVIF
- **Page load time:** 20-40% faster initial load with lazy loading
- **Bandwidth savings:** 40-60% less data transferred

#### Testing
1. Test in multiple browsers (Chrome, Firefox, Safari, Edge)
2. Check Network tab in DevTools to verify:
   - Images load only when scrolled into view (lazy loading)
   - Modern browsers load WebP/AVIF instead of JPG/PNG
3. Use Lighthouse audit to measure improvements

### 4. Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Lazy Loading | 77+ | 75+ | 15.4+ | 79+ |
| WebP | 32+ | 65+ | 14+ | 18+ |
| AVIF | 85+ | 93+ | 16+ | 85+ |

### 5. Future Enhancements

- Implement responsive images with `srcset` for different screen sizes
- Add image CDN for better global performance
- Implement progressive image loading (blur-up effect)
- Consider using `<img>` with `srcset` for art direction
