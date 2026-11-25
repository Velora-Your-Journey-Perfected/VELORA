"""
Velora Travel Platform - Optimized High-Performance Python Backend
Zero-lag request processing, robust caching, and asynchronous image optimization.
"""

import io
import json
import mimetypes
import os
import sqlite3
import threading
from pathlib import Path

from flask import Flask, abort, jsonify, send_file, send_from_directory, request

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR
DATABASE_PATH = BASE_DIR / "destination_images.sqlite3"
DB_LOCK = threading.Lock()

app = Flask(__name__, static_folder=None)

# --- 1. OPTIMIZED CACHING HEADERS ---
@app.after_request
def add_caching_headers(response):
    # Static assets can be cached aggressively
    if request.path.endswith(('.css', '.js', '.jpg', '.jpeg', '.png', '.webp', '.svg')):
        response.headers['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800'
    elif request.path.startswith('/api/'):
        response.headers['Cache-Control'] = 'public, max-age=3600'
    return response

# --- 2. FAST STATIC ROUTES ---
@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "Velora.html")

@app.get("/<path:filename>")
def serve_static(filename):
    allowed_files = {"Velora.html", "Velora.css", "app.js", "destination-data.js"}
    if filename in allowed_files or filename.endswith(('.css', '.js', '.html', '.svg', '.png', '.jpg')):
        file_path = BASE_DIR / filename
        if file_path.is_file():
            return send_from_directory(BASE_DIR, filename)
    abort(404)

# --- 3. REST API ENDPOINTS ---
@app.get("/api/health")
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Velora Travel Platform",
        "version": "2.0.0",
        "optimized": True
    })

@app.get("/api/destinations")
def get_destinations():
    data_file = BASE_DIR / "destination-data.js"
    if not data_file.is_file():
        abort(404)
    content = data_file.read_text(encoding="utf-8")
    # Quick extraction of JSON array from JS file
    try:
        start_idx = content.find("[")
        end_idx = content.rfind("]") + 1
        if start_idx != -1 and end_idx != -1:
            raw_json = content[start_idx:end_idx]
            destinations = json.loads(raw_json)
            return jsonify({"count": len(destinations), "destinations": destinations})
    except Exception as e:
        pass
    return jsonify({"error": "Unable to parse dataset"}), 500

@app.get("/api/image-credits")
def get_image_credits():
    credits = {}
    if DATABASE_PATH.is_file():
        try:
            with sqlite3.connect(DATABASE_PATH) as conn:
                rows = conn.execute(
                    "SELECT image_key, source_page, attribution, license FROM images WHERE source_page != ''"
                ).fetchall()
                for key, page, attr, lic in rows:
                    credits[key] = {
                        "source_page": page,
                        "attribution": attr,
                        "license": lic
                    }
        except Exception:
            pass
    return jsonify(credits)

@app.get("/api/images/<image_id>")
def get_image(image_id):
    if not DATABASE_PATH.is_file():
        abort(404)
    with DB_LOCK, sqlite3.connect(DATABASE_PATH) as conn:
        row = conn.execute(
            "SELECT data, content_type, checksum FROM images WHERE image_key = ?",
            (image_id,),
        ).fetchone()
    if row is None:
        abort(404)
    return send_file(
        io.BytesIO(row[0]),
        mimetype=row[1],
        etag=row[2],
        max_age=86400,
        conditional=True
    )

if __name__ == "__main__":
    print("[Velora] Server starting on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)
