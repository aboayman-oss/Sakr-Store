import argparse
import contextlib
import http.server
import os
import socket
import socketserver
import threading
from pathlib import Path
from typing import Iterable, List

from playwright.sync_api import sync_playwright


@contextlib.contextmanager
def serve_directory(directory: Path):
    # Start a simple HTTP server serving the given directory on a free port
    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        host, port = sock.getsockname()
    httpd = socketserver.TCPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}"
    finally:
        httpd.shutdown()
        httpd.server_close()
        thread.join(timeout=2)


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def capture(pages: Iterable[str], out_dir: Path) -> List[Path]:
    out_paths: List[Path] = []
    root = Path.cwd()

    with sync_playwright() as p:
        chromium = p.chromium
        # Start local server to allow fetch of products.json
        with serve_directory(root) as base_url:
            for page_file in pages:
                page_path = root / page_file
                if not page_path.exists():
                    print(f"[skip] Not found: {page_file}")
                    continue
                name = page_path.stem

                # Desktop context
                desktop_dir = out_dir / "desktop"
                ensure_dir(desktop_dir)
                with chromium.launch(headless=True) as browser:
                    ctx = browser.new_context(
                        viewport={"width": 1440, "height": 900},
                        device_scale_factor=1,
                        user_agent=None,
                    )
                    page = ctx.new_page()
                    page.goto(f"{base_url}/{page_file}", wait_until="load", timeout=30000)
                    page.wait_for_timeout(500)  # small settle time
                    out_path = desktop_dir / f"{name}-desktop-full.png"
                    page.screenshot(path=str(out_path), full_page=True)
                    out_paths.append(out_path)
                    ctx.close()

                # Mobile context (iPhone 12-ish)
                mobile_dir = out_dir / "mobile"
                ensure_dir(mobile_dir)
                with chromium.launch(headless=True) as browser:
                    ctx = browser.new_context(
                        viewport={"width": 375, "height": 812},
                        device_scale_factor=3,
                        is_mobile=True,
                        has_touch=True,
                        user_agent=(
                            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) "
                            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 "
                            "Mobile/15E148 Safari/604.1"
                        ),
                    )
                    page = ctx.new_page()
                    page.goto(f"{base_url}/{page_file}", wait_until="load", timeout=30000)
                    page.wait_for_timeout(500)
                    out_path = mobile_dir / f"{name}-mobile-full.png"
                    page.screenshot(path=str(out_path), full_page=True)
                    out_paths.append(out_path)
                    ctx.close()

    return out_paths


def main():
    parser = argparse.ArgumentParser(description="Capture desktop & mobile screenshots of store pages.")
    parser.add_argument(
        "--pages",
        nargs="*",
        default=["index.html", "product.html", "cart.html"],
        help="List of page files relative to repo root",
    )
    parser.add_argument(
        "--out",
        default=str(Path("screenshots") / "auto"),
        help="Output directory",
    )
    args = parser.parse_args()

    out_dir = Path(args.out)
    ensure_dir(out_dir)

    shots = capture(args.pages, out_dir)
    print(f"Saved {len(shots)} screenshots to {out_dir}")
    for p in shots:
        print(f" - {p}")


if __name__ == "__main__":
    main()
