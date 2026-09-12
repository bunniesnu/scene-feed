export const onRequest = async ({ request: req }: { request: Request }) => {
  try {
    const reqUrl = new URL(req.url);
    const targetUrl = reqUrl.searchParams.get("url") || (await req.json().catch(() => ({}))).url;

    if (!targetUrl) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const match = targetUrl.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/);
    if (!match) {
      return Response.json({ error: "Invalid X/Twitter status URL" }, { status: 400 });
    }

    const res = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(targetUrl)}&omit_script=true`);
    if (!res.ok) {
      return Response.json({ error: "Failed to fetch oEmbed data" }, { status: res.status });
    }

    const data = await res.json() as {
      html: string;
      author_name: string;
      author_url: string;
    };

    const textMatch = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const text = textMatch
      ? textMatch[1]
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim()
      : null;
    const cleanCaption = text ? text.replace(/\s*pic\.twitter\.com\/\S+$/, '').trim() : null;

    // Twitter snowflake ID to ISO timestamp
    const timestamp = new Date(Number((BigInt(match[1]) >> 22n) + 1288834974657n)).toISOString();

    return Response.json({
      caption: cleanCaption,
      author: data.author_name,
      authorUrl: data.author_url,
      timestamp,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};