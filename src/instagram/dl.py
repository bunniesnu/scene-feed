from instaloader import InstaloaderContext, Post
from src.instagram.models import MediaArchiveEntry

def get_post_media_urls(context: InstaloaderContext, shortcode: str):
    post = Post.from_shortcode(context, shortcode)
    return MediaArchiveEntry.from_post(post)

if __name__ == "__main__":
    from instaloader import Instaloader
    L = Instaloader()
    print(get_post_media_urls(L.context, "DZwgJO1yEfs"))