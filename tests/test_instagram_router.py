import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from src.api.main import app  # adjust to your actual app import

client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def reset_instaloader_global():
    """Reset the module-level L singleton between tests so mocks don't leak."""
    import src.api.routers.instagram as router_module
    router_module.L = None
    yield
    router_module.L = None


class TestGetPostMediaUrls:
    def test_valid_post_url_returns_media(self):
        fake_result = {
            "shortcode": "ABC123",
            "media_urls": ["https://example.com/image1.jpg"],
        }
        with patch("src.instagram.dl.get_post_media_urls", return_value=fake_result) as mock_dl, \
             patch("instaloader.Instaloader") as mock_instaloader:
            mock_instaloader.return_value = MagicMock()

            response = client.get(
                "/instagram/post",
                params={"url": "https://www.instagram.com/p/ABC123/"},
            )

        assert response.status_code == 200
        assert response.json() == fake_result
        mock_dl.assert_called_once()
        # second positional/kwarg arg should be the extracted shortcode
        args, kwargs = mock_dl.call_args
        assert "ABC123" in args or kwargs.get("shortcode") == "ABC123"

    def test_reel_url_extracts_shortcode(self):
        fake_result = {"shortcode": "XYZ789", "media_urls": []}
        with patch("src.instagram.dl.get_post_media_urls", return_value=fake_result), \
             patch("instaloader.Instaloader") as mock_instaloader:
            mock_instaloader.return_value = MagicMock()

            response = client.get(
                "/instagram/post",
                params={"url": "https://www.instagram.com/reel/XYZ789/"},
            )

        assert response.status_code == 200

    def test_invalid_url_returns_422(self):
        response = client.get(
            "/instagram/post",
            params={"url": "https://notinstagram.com/p/ABC123/"},
        )
        assert response.status_code == 422
        assert "Invalid Instagram post URL" in response.json()["detail"]

    def test_malformed_instagram_url_returns_422(self):
        response = client.get(
            "/instagram/post",
            params={"url": "https://www.instagram.com/explore/ABC123/"},
        )
        assert response.status_code == 422

    def test_missing_url_param_returns_422(self):
        response = client.get("/instagram/post")
        assert response.status_code == 422

    def test_instaloader_only_initialized_once(self):
        """Verify the global L singleton isn't re-created on every request."""
        fake_result = {"shortcode": "ABC123", "media_urls": []}
        with patch("src.instagram.dl.get_post_media_urls", return_value=fake_result), \
             patch("instaloader.Instaloader") as mock_instaloader:
            mock_instaloader.return_value = MagicMock()

            client.get("/instagram/post", params={"url": "https://www.instagram.com/p/ABC123/"})
            client.get("/instagram/post", params={"url": "https://www.instagram.com/p/DEF456/"})

        mock_instaloader.assert_called_once()

    def test_dl_function_raises_exception(self):
        with patch("src.instagram.dl.get_post_media_urls", side_effect=Exception("Instagram error")), \
             patch("instaloader.Instaloader") as mock_instaloader:
            mock_instaloader.return_value = MagicMock()

            response = client.get(
                "/instagram/post",
                params={"url": "https://www.instagram.com/p/ABC123/"},
            )

        # Currently unhandled -> FastAPI returns 500. Decide if you want
        # explicit error handling in the route for this case.
        assert response.status_code == 500
