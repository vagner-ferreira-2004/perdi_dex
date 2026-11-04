import uuid
from pathlib import Path

from errors import ServiceError

UPLOAD_DIR = Path(__file__).resolve().parents[1] / "uploads"
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


def saveImage(file) -> str:
    if file is None or not file.filename:
        raise ServiceError("photo is required")

    extension = file.filename.rsplit(".", 1)[-1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ServiceError("invalid image type")

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_SIZE:
        raise ServiceError("image too large")

    UPLOAD_DIR.mkdir(exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{extension}"
    file.save(UPLOAD_DIR / filename)
    return filename


def deleteImage(filename: str) -> None:
    (UPLOAD_DIR / filename).unlink(missing_ok=True)