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

    const urlMatch = targetUrl.match(
      /artist\.mnetplus\.world\/main\/stg\/([^/]+)\/(?:story\/feed|community\/board\/[^/]+\/post|surveys|contents|shop\/membership)\/([a-zA-Z0-9_-]+)/i
    );
    if (!urlMatch) {
      return Response.json({ error: "Invalid Mnet Plus URL" }, { status: 400 });
    }

    const [, spaceId] = urlMatch;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ko,en;q=0.9",
      },
    });

    if (!res.ok) {
      return Response.json({ error: "Failed to fetch page HTML" }, { status: res.status });
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
        { error: "Page redirected or not accessible", redirectPath: pageProps.__N_REDIRECT },
        { status: pageProps.__N_REDIRECT_STATUS || 307 }
      );
    }

    const entity =
      pageProps?.post ||
      pageProps?.content ||
      pageProps?.survey ||
      pageProps?.membership ||
      pageProps?.product;

    if (!entity) {
      return Response.json({ error: "Resource not found" }, { status: 404 });
    }

    const rawTitle = entity.title || "";
    const cleanTitle =
      rawTitle.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() || null;

    const rawBody = entity.body || entity.description || "";
    const cleanCaption =
      rawBody.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim() || null;

    const images: string[] = [];
    if (Array.isArray(entity.images)) {
      images.push(...entity.images);
    }
    if (Array.isArray(entity.media)) {
      images.push(...entity.media.filter((m: any) => m.type === "IMAGE").map((m: any) => m.url));
    }
    if (entity.mainImage && !images.includes(entity.mainImage)) {
      images.unshift(entity.mainImage);
    }
    if (entity.thumbnail && !images.includes(entity.thumbnail)) {
      images.unshift(entity.thumbnail);
    }

    const authorObj = entity.author || entity.user || entity.creator;
    const authorName = authorObj?.nickname || authorObj?.name || pageProps?.base?.space?.name || spaceId;
    const authorUrl = authorObj?.id
      ? `https://artist.mnetplus.world/main/stg/${spaceId}/artist/${authorObj.id}`
      : `https://artist.mnetplus.world/main/stg/${spaceId}`;

    return Response.json({
      title: cleanTitle,
      caption: cleanCaption,
      author: authorName,
      authorUrl,
      timestamp: entity.publishedAt || entity.createdAt || entity.startDate || null,
      images,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};