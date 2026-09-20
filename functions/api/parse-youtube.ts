interface Env {
  YOUTUBE_API_KEY: string;
}

export const onRequest = async ({
  request: req,
  env,
}: {
  request: Request;
  env: Env;
}) => {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET" },
    });
  }

  try {
    const rawUrl = new URL(req.url).searchParams.get("url");
    if (!rawUrl) {
      return Response.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const targetUrl = new URL(decodeURIComponent(rawUrl));
    let videoId: string | null = null;

    if (targetUrl.hostname.includes("youtu.be")) {
      videoId = targetUrl.pathname.slice(1);
    } else if (targetUrl.hostname.includes("youtube.com")) {
      videoId =
        targetUrl.searchParams.get("v") ||
        targetUrl.pathname.match(/\/(?:shorts|embed)\/([^/?]+)/)?.[1] ||
        null;
    }

    if (!videoId) {
      return Response.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${env.YOUTUBE_API_KEY}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data.error?.message || "YouTube API error" },
        { status: res.status },
      );
    }

    const video = data.items?.[0]?.snippet;
    if (!video) {
      return Response.json({ error: "Video not found" }, { status: 404 });
    }

    return Response.json({
      videoId,
      title: video.title,
      author: video.channelTitle,
      channelId: video.channelId,
      description: video.description, // Native \n preserved
      timestamp: video.publishedAt,
      thumbnails: video.thumbnails,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
};