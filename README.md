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

## License

[MIT License](LICENSE)
