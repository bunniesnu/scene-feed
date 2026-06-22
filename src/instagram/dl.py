from instaloader import InstaloaderContext, Post

def get_post_media_urls(context: InstaloaderContext, shortcode: str):
    post = Post.from_shortcode(context, shortcode)
    media_urls = []

    if post.typename == "GraphSidecar":
        for node in post.get_sidecar_nodes():
            media_urls.append(node.video_url if node.is_video else node.display_url)
    else:
        media_urls.append(post.video_url if post.is_video else post.url)

    return media_urls

if __name__ == "__main__":
    from instaloader import Instaloader
    L = Instaloader()
    print(get_post_media_urls(L.context, "DZwgJO1yEfs"))