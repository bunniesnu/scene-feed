from instaloader import InstaloaderContext, Post
from src.instagram.models import MediaArchiveEntry

def get_post_media_urls(context: InstaloaderContext, shortcode: str):
    post = Post.from_shortcode(context, shortcode)
    return MediaArchiveEntry.from_post(post)

if __name__ == "__main__":
    from instaloader import Instaloader
    import pathlib
    import json
    L = Instaloader()
    path = pathlib.Path("data")
    path.mkdir(exist_ok=True)
    post1 = path / "post1.json"
    post1.write_text(json.dumps(get_post_media_urls(L.context, "DZwgJO1yEfs").to_json_dict(), indent=2))
    post2 = path / "post2.json"
    post2.write_text(json.dumps(get_post_media_urls(L.context, "DZkHr0oEoTk").to_json_dict(), indent=2))
    post3 = path / "post3.json"
    post3.write_text(json.dumps(get_post_media_urls(L.context, "DZuEHqlhlnU").to_json_dict(), indent=2))