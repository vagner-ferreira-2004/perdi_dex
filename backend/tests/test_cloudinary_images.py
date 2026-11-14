import io
import unittest
from unittest.mock import patch

from werkzeug.datastructures import FileStorage

from errors import ServiceError
from helpers.images import MAX_SIZE, saveImage


class CloudinaryImageTests(unittest.TestCase):
    @patch("helpers.images._configureCloudinary")
    @patch(
        "helpers.images.cloudinary.uploader.upload",
        return_value={
            "secure_url": "https://res.cloudinary.com/demo/image/upload/item.jpg",
            "public_id": "perdidex/items/item",
        },
    )
    def test_saves_remote_asset_metadata(self, upload, _configure):
        image = FileStorage(stream=io.BytesIO(b"image-bytes"), filename="item.jpg")
        result = saveImage(image)

        self.assertEqual(
            result,
            {
                "url": "https://res.cloudinary.com/demo/image/upload/item.jpg",
                "public_id": "perdidex/items/item",
            },
        )
        upload.assert_called_once()

    def test_rejects_missing_file(self):
        with self.assertRaises(ServiceError):
            saveImage(None)

    def test_rejects_unsupported_extension_before_upload(self):
        image = FileStorage(stream=io.BytesIO(b"image-bytes"), filename="item.gif")
        with patch("helpers.images.cloudinary.uploader.upload") as upload:
            with self.assertRaises(ServiceError):
                saveImage(image)
        upload.assert_not_called()

    def test_rejects_oversized_file_before_upload(self):
        image = FileStorage(
            stream=io.BytesIO(b"x" * (MAX_SIZE + 1)),
            filename="item.jpg",
        )
        with patch("helpers.images.cloudinary.uploader.upload") as upload:
            with self.assertRaises(ServiceError):
                saveImage(image)
        upload.assert_not_called()


if __name__ == "__main__":
    unittest.main()
