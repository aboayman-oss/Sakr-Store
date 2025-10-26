# Sakr Store

A simple e-commerce website for selling mugs, tote bags, and t-shirts.
https://aboayman-oss.github.io/Sakr-Store/

## Key Features

- View products
- Add products to cart
- View cart
- Multiple images per product with a primary image and gallery (product page thumbnails)

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

Two ways to generate desktop and mobile screenshots:

### 1) Python + Playwright (recommended)

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

### 2) PowerShell + Edge/Chrome headless (simple, viewport only)

This variant uses Microsoft Edge/Chrome headless directly and does not require Python, but may be less reliable across browser versions and captures only the viewport.

```powershell
# Allow running the script for this session and capture defaults (index, product, cart)
PowerShell -ExecutionPolicy Bypass -File .\capture-screenshots.ps1

# Options
PowerShell -ExecutionPolicy Bypass -File .\capture-screenshots.ps1 -Pages index.html, product.html
PowerShell -ExecutionPolicy Bypass -File .\capture-screenshots.ps1 -Overwrite
PowerShell -ExecutionPolicy Bypass -File .\capture-screenshots.ps1 -BrowserPath "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
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
