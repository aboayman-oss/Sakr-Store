# Sakr Store

A simple e-commerce website for selling mugs, tote bags, and t-shirts.
https://aboayman-oss.github.io/Sakr-Store/

## Key Features

- View products
- Add products to cart
- View cart
- Multiple images per product with a primary image and gallery (product page thumbnails)
- **Full Arabic language support** with modern typography
- **Bidirectional text support** for mixed Arabic/English content
- Automatic text direction detection (RTL/LTR)

## Arabic Language Support

The store now includes comprehensive Arabic language support with modern, professional typography:

### Features

- **Modern Arabic Fonts**: Uses Cairo and Tajawal fonts for beautiful Arabic typography
- **Automatic Detection**: Text direction (RTL/LTR) is automatically detected based on content
- **Mixed Content**: Seamlessly handles products with Arabic names, English descriptions, or any combination
- **Bidirectional Support**: Proper rendering of Arabic text mixed with English words or numbers
- **Consistent Styling**: Maintains the same modern design whether content is in Arabic or English

### How to Use

Simply add products in Arabic to your `products.json` file:

```json
{
  "id": 3,
  "name": "حقيبة توت كبيرة من كانفاس القطنية الثقيلة",
  "price": 19.99,
  "description": "حقيبة توت كبيرة متعددة الاستخدامات مصنوعة من قماش القطن الثقيل، مثالية للتسوق أو الاستخدام اليومي.",
  "category": "Accessories",
  "discount": true,
  "discountedPrice": 14.99
}
```

You can also mix Arabic and English:

```json
{
  "id": 4,
  "name": "Premium T-Shirt - قميص مميز",
  "description": "High quality cotton shirt with modern design - قميص قطني عالي الجودة",
  "category": "Apparel"
}
```

### Typography

- **Arabic Text**: Rendered with Cairo and Tajawal fonts for optimal readability
- **English Text**: Rendered with Inter font for modern, clean appearance
- **Numbers & Prices**: Always displayed LTR for consistency
- **Line Height**: Optimized separately for Arabic (1.7) and English (1.5) for best readability

## Tech Stack

- HTML
- CSS
- JavaScript

## Prerequisites

- A web browser

## Installation

1. Clone the repository: `git clone https://docs.github.com/en/repositories/creating-and-managing-repositories/quickstart-for-repositories`
2. Navigate into the directory: `cd your-repository-name`
3. Open `index.html` in your web browser.

## Usage

Navigate the website using the UI.

### Product images schema

Products support a modern images schema in `products.json` while remaining backward-compatible with the legacy `image` field.

- Legacy (still supported):
	- `image`: string URL displayed everywhere.
- New (preferred):
	- `images.primary`: string URL used on listings and as the default on the product page.
	- `images.gallery`: array of string URLs shown as thumbnails on the product page.

Example product entry:

```
{
	"id": 101,
	"name": "Example Product",
	"price": 123.45,
	"description": "...",
	"category": "Apparel",
	"discount": false,
	"discountedPrice": 123.45,
	"images": {
		"primary": "images/example-main.jpg",
		"gallery": [
			"images/example-side.jpg",
			"images/example-back.jpg"
		]
	}
	// Optional: keep legacy field for older deployments
	// "image": "images/example-main.jpg"
}
```

Notes:
- If `images.primary` is missing, the app falls back to `image`.
- If `images.gallery` is missing or empty, the thumbnails strip is hidden.

## Automated screenshots (no Node.js)

### Python + Playwright (recommended)

This captures full-page screenshots and spins up a temporary local server so `products.json` loads correctly.

```powershell
# 1) Install Python 3.9+
# 2) Install Playwright and its browser
pip install playwright
python -m playwright install chromium

# 3) Run the script from repo root
python .\capture_screenshots.py --out screenshots/auto

# Optional: choose specific pages
python .\capture_screenshots.py --pages index.html product.html --out screenshots/auto
```

Outputs are saved in `screenshots/auto/desktop` and `screenshots/auto/mobile` as full-page PNGs.
```

Notes:
- The PowerShell variant passes `--allow-file-access-from-files` to help local JSON fetches; if it still fails, prefer the Python method above.
- Viewport sizes: 1440x900 (desktop), 375x812 (mobile). Edit `capture-screenshots.ps1` to adjust.

### One-click: Windows batch launcher

Double-click `capture-screenshots.bat` from File Explorer (or run it in PowerShell). It will:
- Try the Python + Playwright method first (full-page).
- If Python/Playwright isn’t available, fall back to the PowerShell method.

## License

[MIT License](LICENSE)
