export const onRequest = async ({ request: req }: { request: Request }) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  try {
    const url = new URL(req.url).searchParams.get("url");

    if (!url) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const targetUrl = decodeURIComponent(url);

    const urlMatch = targetUrl.match(/artist\.mnetplus\.world\/main\/stg\/([^/]+)\/story\/feed\/([a-f0-9]+)/i);
    if (!urlMatch) {
      return Response.json({ error: "Invalid Mnet Plus feed URL" }, { status: 400 });
    }

    const [, spaceId, feedId] = urlMatch;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko,en;q=0.9",
      },
    });

    if (!res.ok) {
      return Response.json({ error: "Failed to fetch post HTML" }, { status: res.status });
    }

    const html = await res.text();
    const scriptMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);

    if (!scriptMatch) {
      return Response.json({ error: "__NEXT_DATA__ not found" }, { status: 404 });
    }

    const data = JSON.parse(scriptMatch[1]);
    const pageProps = data?.props?.pageProps;

    if (pageProps?.__N_REDIRECT) {
      return Response.json(
        { error: "Post redirected or not accessible", redirectPath: pageProps.__N_REDIRECT },
        { status: pageProps.__N_REDIRECT_STATUS || 307 }
      );
    }

    const post = pageProps?.post;
    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({
      caption: post.body?.trim() ?? post.title?.trim() ?? null,
      author: post.author?.nickname ?? null,
      authorUrl: post.author?.id ? `https://artist.mnetplus.world/main/stg/${spaceId}/artist/${post.author.id}` : null,
      timestamp: post.publishedAt ?? post.createdAt ?? null,
      images: post.images ?? [],
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};