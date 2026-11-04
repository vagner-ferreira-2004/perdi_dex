import os
from pathlib import Path
from typing import Any, Dict

import cloudinary
import cloudinary.uploader
from errors import ServiceError

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "avif"}
MAX_SIZE = 10 * 1024 * 1024


def _configureCloudinary() -> None:
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    if not all((cloud_name, api_key, api_secret)):
        raise RuntimeError(
            "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and "
            "CLOUDINARY_API_SECRET must be configured"
        )

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def saveImage(file) -> Dict[str, Any]:
    if file is None or not file.filename:
        raise ServiceError("photo is required")

    extension = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if extension not in ALLOWED_EXTENSIONS:
        raise ServiceError("invalid image type")

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_SIZE:
        raise ServiceError("image too large")

    _configureCloudinary()
    result = cloudinary.uploader.upload(
        file.stream,
        folder="perdidex/items",
        resource_type="image",
        allowed_formats=sorted(ALLOWED_EXTENSIONS),
        unique_filename=True,
        use_filename=False,
    )
    secure_url = result.get("secure_url")
    public_id = result.get("public_id")
    if not secure_url or not public_id:
        raise RuntimeError("Cloudinary upload response is missing asset metadata")
    return {"url": secure_url, "public_id": public_id}


def deleteImage(public_id: str) -> None:
    if not public_id:
        return
    _configureCloudinary()
    result = cloudinary.uploader.destroy(public_id, resource_type="image")
    if result.get("result") not in {"ok", "not found"}:
        raise RuntimeError("Cloudinary did not confirm image deletion")