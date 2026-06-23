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
    posts = [
        "DZwgJO1yEfs",  # single image post
        "DZkHr0oEoTk",  # sidecar post with 4 items
        "DZuEHqlhlnU",  # video post with music attribution
    ]
    for i, post in enumerate(posts):
        post_path = path / f"post{i+1}.json"
        if not post_path.exists():
            post_path.write_text(json.dumps(get_post_media_urls(L.context, post).to_json_dict(), indent=2))