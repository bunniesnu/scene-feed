export const onRequest = async ({ request: req }: { request: Request }) => {
  try {
    const reqUrl = new URL(req.url);
    const targetUrl = reqUrl.searchParams.get("url") || (await req.json().catch(() => ({}))).url;

    if (!targetUrl) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    let embedUrl: URL;
    try {
      embedUrl = new URL(targetUrl);
    } catch {
      return Response.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const isInstagram = /(?:^|\.)instagram\.com$/.test(embedUrl.hostname);
    const isPost = /^\/(?:[\w.-]+\/)?(?:p|reel|tv|stories)\/[\w-]+/.test(embedUrl.pathname);

    if (!isInstagram || !isPost) {
      return Response.json(
        { error: "URL must be a valid Instagram post (/p/, /reel/, or /tv/)" },
        { status: 400 },
      );
    }

    const postMatch = embedUrl.pathname.match(/\/(?:p|reel|tv|stories)\/[\w-]+/);
    if (postMatch) {
      embedUrl.pathname = `${postMatch[0]}/embed/captioned/`;
    }

    const res = await fetch(embedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();

    // 1. Extract from the visible .Caption element
    let caption: string | null = null;
    const captionBlock = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
    if (captionBlock) {
      caption = captionBlock[1]
        .replace(/<a class="CaptionUsername"[^>]*>[\s\S]*?<\/a>/gi, "")
        .replace(/<div class="CaptionComments"[^>]*>[\s\S]*?<\/div>/gi, "")
        .replace(/View all \d+ comments/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&#064;/g, "@")
        .replace(/&amp;/g, "&")
        .trim();
    }

    // Fallback: parse from embedded JSON string
    if (!caption) {
      const jsonMatch = html.match(/"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"([\s\S]*?)"\}\}\]\}/);
      if (jsonMatch) {
        try {
          caption = JSON.parse(`"${jsonMatch[1]}"`);
        } catch {
          caption = jsonMatch[1];
        }
      }
    }

    // 2. Parse timestamp
    const mediaIdMatch = html.match(/data-media-id="(\d+)"/);
    const mediaId = mediaIdMatch ? BigInt(mediaIdMatch[1]) : null;
    const timestamp = mediaId
      ? new Date(Number((mediaId >> 23n) + 1314220021721n)).toISOString()
      : null;

    return Response.json({ caption, timestamp });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};